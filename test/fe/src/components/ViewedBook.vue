<template>
    <div
        class="block-wrapper"
        :class="[{ open: isOpen }]"
        :style="{
            height: isOpen
                ? `${headerHeight + elHeight}px`
                : `${headerHeight}px`,
        }"
    >
        <div
            class="block-header"
            @click="isOpen = !isOpen"
            :class="{ open: isOpen }"
        >
            Наименование справочника: {{ viewedBook.name }}
            <ArrowIcon class="arrow" />
        </div>
        <div
            ref="mainEl"
            class="block-main"
            :class="{ open: isOpen }"
            :style="{ top: isOpen ? 0 : `-${elHeight}px` }"
        >
            <SearchForm
                :codes="codes"
                :names="names"
                :needToReqDate="true"
                @search="getData"
            />
            <Table
                :data="data"
                :titles="['', 'Код', 'Название']"
                :config="['', 'code', 'ru_name']"
                :curPage="curPage"
                :elNum="elNum"
                :totalNum="totalNum"
                :selectedItems="selectedItems"
                @setElNum="setElNum"
                @setCurPage="setCurPage"
                @handleAllSelectChange="handleAllSelectChange"
                @handleChange="handleChange"
                @setHeight="setHeight"
            />
            <div class="btn close-btn" @click="handleClose">Закрыть</div>
        </div>
    </div>
</template>

<script lang="ts">
import axios from "axios";
import {
    defineComponent,
    ref,
    onMounted,
    PropType,
    watch,
    onBeforeMount,
} from "@vue/composition-api";
import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import ArrowIcon from "@/assets/ArrowIcon.vue";
import SearchForm from "@/components/SearchForm.vue";
import Table from "@/components/UI/Table.vue";

Vue.use(VueCompositionAPI);

export default defineComponent({
    name: "ViewedBook",
    props: {
        viewedBook: {
            type: Object as PropType<{
                name: string;
                type: string;
                code: string;
            }>,
            required: true,
        },
    },
    emits: ["removeBook"],
    setup(props, { emit }) {
        const isOpen = ref(true);
        const elHeight = ref(0);
        const headerHeight = 60;
        const mainEl = ref<HTMLElement | null>(null);
        const codes = ref(null);
        const names = ref(null);
        const dateFrom = ref(null);
        const dateTo = ref(null);
        const data = ref<
            {
                ru_name: string;
                code: string;
                dateFrom: string;
                dateTo: string;
            }[]
        >([]);
        const allData = ref<
            {
                ru_name: string;
                code: string;
                dateFrom: string;
                dateTo: string;
            }[]
        >([]);
        const curPage = ref(0);
        const totalNum = ref(0);
        const elNum = ref(4);
        const curName = ref("");
        const curCode = ref("");
        const curDateFrom = ref();
        const curDateTo = ref();
        const selectedItems = ref<string[]>([]); //by code

        function handleClose() {
            emit("removeBook", props.viewedBook.code);
        }

        async function getNames() {
            try {
                const res = await axios.post(
                    "http://localhost:3000/referenceBookNames",
                    { name: props.viewedBook.name }
                );
                names.value = res.data;
            } catch (error) {
                console.error(error);
            }
        }

        async function getCodes() {
            try {
                const res = await axios.post(
                    "http://localhost:3000/referenceBookCodes",
                    { code: props.viewedBook.code }
                );
                codes.value = res.data;
            } catch (error) {
                console.error(error);
            }
        }

        async function getAllData(
            name: string,
            code: string,
            dateFrom: string,
            dateTo: string
        ) {
            try {
                curName.value = name;
                curCode.value = code;
                curDateFrom.value = dateFrom
                    ? dateFrom.split("-").reverse().join(".")
                    : "";
                curDateTo.value = dateTo
                    ? dateTo.split("-").reverse().join(".")
                    : "";
                const res = await axios.post(
                    "http://localhost:3000/referenceBookData",
                    {
                        modelCode: props.viewedBook.code,
                        name: name,
                        code: code,
                        dateFrom: curDateFrom.value,
                        dateTo: curDateTo.value,
                        page: curPage.value,
                        elNum: "all",
                    }
                );
                allData.value = res.data.newData;
                totalNum.value = res.data.num;
            } catch (error) {
                console.error(error);
            }
        }
        async function getData(
            name: string,
            code: string,
            dateFrom: string,
            dateTo: string
        ) {
            try {
                if (
                    name !== curName.value ||
                    code !== curCode.value ||
                    dateFrom !== curDateFrom.value ||
                    dateTo !== curDateTo.value
                ) {
                    curPage.value = 0;
                }
                curName.value = name;
                curCode.value = code;
                curDateFrom.value = dateFrom
                    ? dateFrom.split("-").reverse().join(".")
                    : "";
                curDateTo.value = dateTo
                    ? dateTo.split("-").reverse().join(".")
                    : "";
                const res = await axios.post(
                    "http://localhost:3000/referenceBookData",
                    {
                        modelCode: props.viewedBook.code,
                        name: name,
                        code: code,
                        dateFrom: curDateFrom.value,
                        dateTo: curDateTo.value,
                        page: curPage.value,
                        elNum: elNum.value,
                    }
                );
                data.value = res.data.newData;
                totalNum.value = res.data.num;
                getAllData(
                    curName.value,
                    curCode.value,
                    curDateFrom.value,
                    curDateTo.value
                );
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
            getData(
                curName.value,
                curCode.value,
                curDateFrom.value,
                curDateTo.value
            );
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
                    elHeight.value = mainEl.value.offsetHeight;
                }
            }, timeout);
        }

        onBeforeMount(() => {
            getCodes();
            getNames();
            getData(
                curName.value,
                curCode.value,
                curDateFrom.value,
                curDateTo.value
            );
        });

        onMounted(() => {
            setHeight(1000);
        });

        watch(data, () => {
            setHeight();
        });

        return {
            isOpen,
            elHeight,
            headerHeight,
            mainEl,
            data,
            curPage,
            totalNum,
            elNum,
            codes,
            names,
            curCode,
            curName,
            allData,
            dateFrom,
            dateTo,
            curDateFrom,
            curDateTo,
            selectedItems,
            handleClose,
            getData,
            getCodes,
            getNames,
            getAllData,
            setHeight,
            setElNum,
            setCurPage,
            handleAllSelectChange,
            handleChange,
        };
    },
    components: {
        ArrowIcon,
        SearchForm,
        Table,
    },
});
</script>

<style lang="scss" scoped>
.block {
    &-wrapper {
        display: flex;
        flex-direction: column;
        margin: 0;
        transition: all 0.5s;
        background: #e3edf4;
        border-radius: 8px;
        overflow: hidden;

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

.btn.close-btn {
    width: fit-content;
    align-self: end;
    color: #fcf8f3;
    background: #648194;
}
</style>
