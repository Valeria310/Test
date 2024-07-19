<template>
    <div
        class="block-wrapper"
        :class="[{ open: isOpen }, { hidden: isHidden }]"
        :style="{
            height: isOpen
                ? `${headerHeight + elHeight}px`
                : `${headerHeight}px`,
        }"
    >
        <div
            class="block-header"
            @click="
                () => {
                    setIsHidden(true);
                    isOpen = !isOpen;
                }
            "
            :class="{ open: isOpen }"
        >
            Реестр справочников
            <ArrowIcon class="arrow" />
        </div>
        <div
            ref="mainEl"
            class="block-main"
            :class="{ open: isOpen }"
            :style="{ top: isOpen ? 0 : `-${elHeight}px` }"
        >
            <SearchForm
                :types="types"
                :names="names"
                :codes="codes"
                @search="getData"
            />
            <Table
                :data="data"
                :titles="[
                    '',
                    'Код справочника',
                    'Тип справочника',
                    'Наименование справочника',
                ]"
                :config="['', 'code', 'type', 'name']"
                :curPage="curPage"
                :elNum="elNum"
                :totalNum="totalNum"
                :selectedItems="selectedItems"
                @setElNum="setElNum"
                @setCurPage="setCurPage"
                @setIsHidden="setIsHidden"
                @setViewedProp="setViewedProp"
                @setViewedBook="setViewedBook"
                @handleAllSelectChange="handleAllSelectChange"
                @handleChange="handleChange"
                @setHeight="setHeight"
            />
        </div>
    </div>
</template>

<script lang="ts">
import axios from "axios";
import {
    defineComponent,
    ref,
    onBeforeMount,
    watch,
    onMounted,
} from "@vue/composition-api";
import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import ArrowIcon from "@/assets/ArrowIcon.vue";
import SearchForm from "@/components/SearchForm.vue";
import Table from "@/components/UI/Table.vue";

Vue.use(VueCompositionAPI);

export default defineComponent({
    name: "ReferenceBooks",
    emits: ["setViewedProp", "setViewedBook"],
    setup(props, { emit }) {
        const data = ref<
            {
                type: string;
                name: string;
                code: string;
                dateFrom: string;
                dateTo: string;
            }[]
        >([]);
        const allData = ref<
            {
                type: string;
                name: string;
                code: string;
                dateFrom: string;
                dateTo: string;
            }[]
        >([]);
        const types = ref(null);
        const names = ref(null);
        const codes = ref(null);
        const curPage = ref(0);
        const totalNum = ref(0);
        const elNum = ref(4);
        const isOpen = ref(true);
        const isHidden = ref(true);
        const mainEl = ref<HTMLElement | null>(null);
        const elHeight = ref(0);
        const headerHeight = 60;
        const curType = ref("");
        const curName = ref("");
        const curCode = ref("");
        const selectedItems = ref<string[]>([]); //by code

        async function getTypes() {
            try {
                const res = await axios.get("http://localhost:3000/types");
                types.value = res.data;
            } catch (error) {
                console.error(error);
            }
        }

        async function getNames() {
            try {
                const res = await axios.get("http://localhost:3000/names");
                names.value = res.data;
            } catch (error) {
                console.error(error);
            }
        }

        async function getCodes() {
            try {
                const res = await axios.get("http://localhost:3000/codes");
                codes.value = res.data;
            } catch (error) {
                console.error(error);
            }
        }

        async function getAllData(type: string, name: string, code: string) {
            try {
                curType.value = type;
                curName.value = name;
                curCode.value = code;
                const res = await axios.post(
                    "http://localhost:3000/referenceBooks",
                    {
                        type: type,
                        name: name,
                        code: code,
                        page: curPage.value,
                        elNum: "all",
                    }
                );
                allData.value = res.data.referenceBooks;
                totalNum.value = res.data.num;
            } catch (error) {
                console.error(error);
            }
        }

        async function getData(type: string, name: string, code: string) {
            try {
                if (
                    type !== curType.value ||
                    name !== curName.value ||
                    code !== curCode.value
                ) {
                    curPage.value = 0;
                }
                curType.value = type;
                curName.value = name;
                curCode.value = code;
                const res = await axios.post(
                    "http://localhost:3000/referenceBooks",
                    {
                        type: type,
                        name: name,
                        code: code,
                        page: curPage.value,
                        elNum: elNum.value,
                    }
                );
                data.value = res.data.referenceBooks;
                totalNum.value = res.data.num;
                getAllData(curType.value, curName.value, curCode.value);
            } catch (error) {
                console.error(error);
            }
        }

        function setElNum(num: number) {
            elNum.value = num;
            setCurPage(0);
        }

        function setCurPage(num: number) {
            curPage.value = num;
            getData(curType.value, curName.value, curCode.value);
        }

        function setIsHidden(res: boolean) {
            isHidden.value = res;
        }

        function setViewedProp(code?: string) {
            const el = allData.value.find((el) => el.code === code);
            emit("setViewedProp", el);
        }

        function setViewedBook(codes: string[]) {
            const vals: { name: string; type: string; code: string }[] = [];
            codes.forEach((code) => {
                const el = allData.value.find((elem) => elem.code === code);
                if (el) vals.push(el);
            });
            emit("setViewedBook", vals);
        }

        function handleAllSelectChange(res: boolean) {
            selectedItems.value = res ? allData.value.map((el) => el.code) : [];
        }

        function handleChange(res: boolean, code: string) {
            let prevArr = [...selectedItems.value];
            if (res) {
                prevArr.push(code);
            } else {
                prevArr = prevArr.filter((el) => el !== code);
            }
            selectedItems.value = [...prevArr];
        }

        function setHeight(timeout: number = 200) {
            setTimeout(() => {
                if (mainEl.value) {
                    elHeight.value = mainEl.value.offsetHeight + 60;
                }
            }, timeout);
        }

        onBeforeMount(() => {
            getTypes();
            getNames();
            getCodes();
        });

        onMounted(() => {
            setHeight(1000);
        });

        watch(data, () => {
            setHeight();
        });

        watch(selectedItems, () => {
            setViewedProp();
        });

        return {
            data,
            types,
            names,
            codes,
            isOpen,
            isHidden,
            mainEl,
            elHeight,
            headerHeight,
            curPage,
            elNum,
            totalNum,
            curType,
            curName,
            curCode,
            selectedItems,
            allData,
            getData,
            setElNum,
            setCurPage,
            setIsHidden,
            setViewedProp,
            setViewedBook,
            handleAllSelectChange,
            handleChange,
            getAllData,
            setHeight,
        };
    },
    components: {
        ArrowIcon,
        SearchForm,
        Table,
    },
});
</script>

<style lang="scss">
.block {
    &-wrapper {
        display: flex;
        flex-direction: column;
        margin: 0;
        transition: all 0.5s;
        background: #e3edf4;
        border-radius: 8px;

        &.open {
            box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);
        }

        &.hidden {
            overflow: hidden;
        }
    }

    &-header {
        height: 60px;
        background: #455a64;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        padding: 20px;
        color: #fcf8f3;
        user-select: none;
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;

        & .arrow {
            transition: all 0.5s;
            transform: rotate(90deg);
        }

        &:hover .arrow {
            transform: rotate(180deg);
        }

        &.open .arrow {
            transform: rotate(270deg);
        }
    }

    &-main {
        transition: all 0.5s;
        position: relative;
        opacity: 0;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;

        &.open {
            opacity: 1;
        }
    }
}
</style>
