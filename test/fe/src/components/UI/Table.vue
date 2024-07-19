<template>
    <div class="table-wrapper">
        <div class="table-controls">
            <div
                class="menu-wrapper actions-menu-wrapper"
                @click="handleActionsMenuClick"
            >
                <ArrowIcon
                    :isBlack="true"
                    class="actions-menu-arrow"
                    :class="{ open: isActionsMenuOpen }"
                />
                Выбор действия
                <div v-if="isActionsMenuOpen" class="actions-menu" @click.stop>
                    <div
                        class="actions-menu-item"
                        @click.stop
                        v-for="(action, i) in actions"
                        :key="i"
                        :class="[
                            { disabled: action.isDisable },
                            { smaller: action.values },
                            { hoveravle: !action.values },
                        ]"
                        @click="
                            () => {
                                if (action.action && !action.isDisable)
                                    action.action();
                            }
                        "
                    >
                        {{ action.name }}
                        <ArrowIcon
                            v-if="action.values && !action.isDisable"
                            :isBlack="true"
                            class="actions-menu-item-arrow"
                        />
                        <div
                            v-if="action.values && !action.isDisable"
                            class="additional-menu"
                        >
                            <div
                                class="additional-menu-item"
                                v-for="(val, j) in action.values"
                                :key="j"
                                :class="[{ disabled: val.isDisable }]"
                            >
                                {{ val.name }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="btn menu-wrapper" @click="handleMenuClick">
                Настройки таблицы
                <div v-if="isMenuOpen" class="menu" @click.stop>
                    <div class="menu-item" @click.stop>
                        <input
                            type="checkbox"
                            v-model="showDateFrom"
                            :id="'dateFrom'"
                            @click.stop
                        />
                        <label
                            class="menu-item-label"
                            :for="'dateFrom'"
                            @click.stop
                            >Дата начала действия</label
                        >
                    </div>
                    <div class="menu-item" @click.stop>
                        <input
                            type="checkbox"
                            v-model="showDateTo"
                            :id="'dateTo'"
                            @click.stop
                        />
                        <label
                            class="menu-item-label"
                            :for="'dateTo'"
                            @click.stop
                            >Дата окончания действия</label
                        >
                    </div>
                </div>
            </div>
        </div>
        <table class="table border blnone brnone">
            <thead class="table-header">
                <tr>
                    <th
                        class="border"
                        v-for="(item, i) in curTitles"
                        :key="i"
                        :class="[
                            { 'blnone w30': !i },
                            { brnone: i === curTitles.length - 1 },
                        ]"
                    >
                        <CheckBox
                            v-if="!item"
                            :checked="isAllSelected"
                            :cantChange="!data.length"
                            @onChange="handleAllSelectChange"
                        />
                        {{ item }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="data.length" v-for="(el, i) in data" :key="i">
                    <td
                        class="border"
                        v-for="(item, j) in curConfig"
                        :key="item"
                        :class="[
                            { 'blnone w30': !j },
                            { 'brnone text-left': j === curConfig.length - 1 },
                        ]"
                    >
                        <CheckBox
                            v-if="!item"
                            :checked="
                                selectedItems && selectedItems.includes(el.code)
                            "
                            :cantChange="false"
                            :code="el.code"
                            @onChange="handleChange"
                        />
                        {{ el[item] }}
                    </td>
                </tr>
                <tr v-if="!data.length">
                    <td colspan="4">Нет доступных данных</td>
                </tr>
            </tbody>
        </table>
        <div class="pagination-wrapper">
            <div v-if="totalNum" class="pagination">
                Элементы на странице
                <div class="pagination-inner">
                    <DropDown class="drop-main">
                        <template #trigger-element="{ onClick }">
                            <button class="drop-main-button" @click="onClick">
                                <div class="drop-main-button-inner">
                                    {{ elNum }}
                                </div>
                            </button>
                        </template>
                        <template #body="{ isOpen, onSelect }">
                            <div class="drop-inner" v-if="isOpen">
                                <div class="drop-inner-container">
                                    <div
                                        v-for="num in [2, 4, 6, 8, 10]"
                                        :key="num"
                                        class="list-item"
                                        :class="{ on: elNum === num }"
                                        @click="
                                            () => {
                                                $emit('setElNum', num);
                                                onSelect();
                                            }
                                        "
                                    >
                                        {{ num }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </DropDown>
                    <div class="page-inner">
                        <div
                            class="arrow-wrapper"
                            @click="
                                () => {
                                    if (curPage) {
                                        $emit('setCurPage', curPage - 1);
                                    }
                                }
                            "
                        >
                            <ArrowIcon
                                :isBlack="true"
                                :disable="!curPage"
                                class="left"
                                :class="{ pointer: curPage }"
                            />
                        </div>
                        {{ curPage + 1 }}
                        <div
                            class="arrow-wrapper"
                            @click="
                                () => {
                                    if (
                                        Math.ceil(totalNum / elNum) !==
                                        curPage + 1
                                    ) {
                                        $emit('setCurPage', curPage + 1);
                                    }
                                }
                            "
                        >
                            <ArrowIcon
                                :isBlack="true"
                                :disable="
                                    Math.ceil(totalNum / elNum) === curPage + 1
                                "
                                :class="{
                                    pointer:
                                        Math.ceil(totalNum / elNum) !==
                                        curPage + 1,
                                }"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
    onBeforeUnmount,
    PropType,
    ref,
    computed,
    watch,
} from "@vue/composition-api";
import DropDown from "@/components/UI/DropDown.vue";
import ArrowIcon from "@/assets/ArrowIcon.vue";
import CheckBox from "@/components/UI/CheckBox.vue";

export default defineComponent({
    name: "Table",
    components: { DropDown, ArrowIcon, CheckBox },
    props: {
        data: {
            type: Array as PropType<
                { type: string; name: string; code: string }[]
            >,
            default: () => [],
            required: false,
        },
        titles: {
            type: Array as PropType<string[]>,
            required: true,
        },
        config: {
            type: Array as PropType<string[]>,
            required: true,
        },
        selectedItems: {
            type: Array as PropType<string[]>,
            required: false,
        },
        curPage: {
            type: Number,
            required: true,
        },
        elNum: {
            type: Number,
            required: true,
        },
        totalNum: {
            type: Number,
            required: true,
        },
    },
    emits: [
        "setElNum",
        "setCurPage",
        "setIsHidden",
        "setViewedProp",
        "setViewedBook",
        "handleAllSelectChange",
        "handleChange",
        "setHeight",
    ],
    setup(props, { emit }) {
        const isMenuOpen = ref(false);
        const isActionsMenuOpen = ref(false);
        const showDateFrom = ref(false);
        const showDateTo = ref(false);
        const curTitles = ref(props.titles);
        const curConfig = ref(props.config);

        const isAllSelected = computed(() => {
            const res = !!(
                props.totalNum &&
                props.selectedItems &&
                props.totalNum === props.selectedItems.length
            );
            return res;
        });

        const actions = computed<
            {
                name: string;
                isDisable: boolean;
                action?: Function;
                values?: {
                    name: string;
                    isDisable: boolean;
                    action?: Function;
                }[];
            }[]
        >(() => {
            const res = [
                { name: "Создать справочник", isDisable: true },
                {
                    name: "Просмотреть справочник",
                    isDisable: !(
                        props.selectedItems && props.selectedItems.length
                    ),
                    action: viewBook,
                },
                {
                    name: "Редактировать паспорт/структуру справочника",
                    isDisable: true,
                },
                {
                    name: "Просмотреть свойства справочника",
                    isDisable: !!(
                        props.selectedItems && props.selectedItems.length !== 1
                    ),
                    action: viewProps,
                },
                {
                    name: "Архивировать",
                    isDisable: true,
                },
                {
                    name: "Удалить",
                    isDisable: true,
                },
                {
                    name: "Загрузить JSON/CSV/XML",
                    isDisable: true,
                },
                {
                    name: "Загрузить JSON/CSV/XML через API",
                    isDisable: true,
                },
                {
                    name: "Выгрузить Реестр НСИ",
                    isDisable: true,
                },
                {
                    name: "Выгрузить справочник",
                    isDisable: true,
                    // isDisable: !props.data.length,
                    values: props.data.map((el) => {
                        return {
                            name: el.name,
                            isDisable: true,
                            // isDisable: el.type !== "Пользовательский",
                        };
                    }),
                },
            ];
            return res;
        });

        function viewProps() {
            emit(
                "setViewedProp",
                props.selectedItems ? props.selectedItems[0] : undefined
            );
            isActionsMenuOpen.value = false;
        }

        function viewBook() {
            emit("setViewedBook", props.selectedItems);
            isActionsMenuOpen.value = false;
        }

        function handleWindowClick(e: Event) {
            const target = e.target as HTMLElement;
            if (!target.closest(".menu-wrapper")) {
                isMenuOpen.value = false;
                isActionsMenuOpen.value = false;
                window.removeEventListener("click", handleWindowClick);
            }
        }

        function handleMenuClick() {
            isMenuOpen.value = !isMenuOpen.value;
            if (isMenuOpen.value) {
                isActionsMenuOpen.value = false;
                setTimeout(() => {
                    window.addEventListener("click", handleWindowClick);
                }, 100);
            }
        }

        function handleActionsMenuClick() {
            isActionsMenuOpen.value = !isActionsMenuOpen.value;
            emit("setIsHidden", false);
            if (isActionsMenuOpen.value) {
                isMenuOpen.value = false;
                setTimeout(() => {
                    window.addEventListener("click", handleWindowClick);
                }, 100);
            }
        }

        function handleAllSelectChange(res: boolean) {
            emit("handleAllSelectChange", res);
        }

        function handleChange(res: boolean, code: string) {
            emit("handleChange", res, code);
        }

        onBeforeUnmount(() => {
            window.removeEventListener("click", handleWindowClick);
        });

        watch(showDateFrom, () => {
            if (showDateFrom.value) {
                if (curTitles.value.includes("Дата окончания действия")) {
                    const prevArr = [...curTitles.value];
                    prevArr[prevArr.length - 1] = "Дата начала действия";
                    prevArr.push("Дата окончания действия");
                    curTitles.value = [...prevArr];
                } else {
                    curTitles.value.push("Дата начала действия");
                }
                if (curConfig.value.includes("dateTo")) {
                    const prevArr = [...curConfig.value];
                    prevArr[prevArr.length - 1] = "dateFrom";
                    prevArr.push("dateTo");
                    curConfig.value = [...prevArr];
                } else {
                    curConfig.value.push("dateFrom");
                }
            } else {
                curTitles.value = curTitles.value.filter(
                    (el) => el !== "Дата начала действия"
                );
                curConfig.value = curConfig.value.filter(
                    (el) => el !== "dateFrom"
                );
            }
            emit("setHeight");
        });

        watch(showDateTo, () => {
            if (showDateTo.value) {
                curTitles.value.push("Дата окончания действия");
                curConfig.value.push("dateTo");
            } else {
                curTitles.value = curTitles.value.filter(
                    (el) => el !== "Дата окончания действия"
                );
                curConfig.value = curConfig.value.filter(
                    (el) => el !== "dateTo"
                );
            }
            emit("setHeight");
        });

        return {
            isMenuOpen,
            isAllSelected,
            actions,
            isActionsMenuOpen,
            showDateFrom,
            showDateTo,
            curTitles,
            curConfig,
            handleMenuClick,
            handleAllSelectChange,
            handleChange,
            handleActionsMenuClick,
            viewProps,
            viewBook,
        };
    },
});
</script>
<style lang="scss" scoped>
.table-wrapper {
    border-radius: 0 0 6px 6px;
    box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);
}
.table {
    width: 100%;
    border-collapse: collapse;

    &-header {
        background: #e7e7e7;
        height: 40px;
    }

    &-controls {
        background: #ffffff;
        display: flex;
        align-items: start;
        justify-content: space-between;
        padding: 20px 10px;
    }
}

.pagination-wrapper {
    background: #ffffff;
    height: 60px;
    border-radius: 0 0 6px 6px;
    display: flex;
    justify-content: end;
}

.pagination {
    width: 500px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    &-inner {
        display: flex;
        align-items: center;
        gap: 20px;
    }
}

.border {
    border: 1px solid black;
}

th {
    padding: 0;
    text-wrap: nowrap;
    padding: 6px;
}

td {
    padding: 6px;
    height: 40px;
    text-align: center;
    background: #e3edf4;
}

.w30 {
    width: 30px;
}

.blnone {
    border-left: none;
}

.brnone {
    border-right: none;
}

.text-left {
    text-align: left;
}

.menu-wrapper {
    position: relative;
}

.actions-menu-wrapper {
    background: #f4f4f6;
    border-radius: 6px;
    padding: 8px 12px;
    padding-left: 32px;
    user-select: none;
    font-weight: bold;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
        background: #dbdbdb;

        & .actions-menu-arrow {
            transform: rotate(0);
        }
    }
}

.additional-menu {
    padding: 10px;
    transition: all 0.3s;
    background: #ffffff;

    &-item {
        min-height: 30px;
        border-radius: 4px;
        padding: 8px;
        padding-right: 12px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        color: #828282;
        background: #ffffff;
        cursor: pointer;

        &:hover {
            padding-left: 12px;
            padding-right: 8px;
            background: #dbd9d9;
        }

        &.disabled {
            background: #ffffff;
            color: #e7e7e7;
            cursor: auto;

            &:hover {
                background: #ffffff;
                padding-left: 8px;
                padding-right: 12px;
            }
        }
    }
}

.hoveravle {
    &.smaller:hover {
        padding-left: 12px;
        padding-right: 32px;
        background: #dbd9d9;
    }

    &:hover {
        padding-left: 12px;
        padding-right: 8px;
        background: #dbd9d9;
    }

    &.disabled {
        &:hover {
            background: #ffffff;
            padding-left: 8px;
            padding-right: 12px;
        }

        &.smaller:hover {
            padding-right: 36px;
        }
    }
}

.actions-menu {
    position: absolute;
    z-index: 2;
    left: 0;
    background: #ffffff;
    border-radius: 0 0 6px 6px;
    box-shadow: 8px 8px 8px 8px rgba(34, 60, 80, 0.2);
    top: 120%;
    padding: 10px;
    max-height: 400px;
    overflow-y: scroll;

    &-arrow {
        position: absolute;
        left: 8px;
        top: 10px;
        transition: all 0.3s;
        transform: rotate(90deg);

        &.open {
            transform: rotate(-90deg) !important;
        }
    }

    &-item {
        width: 400px;
        min-height: 30px;
        border-radius: 4px;
        padding-left: 8px;
        padding-right: 12px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        color: #828282;
        background: #ffffff;
        cursor: pointer;
        position: relative;
        flex-direction: column;
        align-items: start;
        justify-content: center;

        &.smaller {
            padding-right: 36px;
        }

        &-arrow {
            position: absolute;
            left: 200px;
            top: 2px;
            transform: rotate(90deg);
        }

        &.disabled {
            background: #ffffff;
            color: #e7e7e7;
            cursor: auto;
        }
    }
}

.menu {
    position: absolute;
    right: 0;
    background: #ffffff;
    border-radius: 0 0 6px 6px;
    box-shadow: 8px 8px 8px 8px rgba(34, 60, 80, 0.2);
    top: 120%;
    padding: 10px;

    &-item {
        width: 300px;
        height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;

        &-label {
            cursor: pointer;
            user-select: none;
            font-weight: normal;
            padding-left: 5px;
        }
    }
}

.drop-main {
    display: table-cell;
    font-size: 14px;
    box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);

    &-button {
        border-radius: 4px;
        height: 40px;
        width: 60px;
        background: transparent;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border: none;
        outline: none;
        &-inner {
            color: #828282;
            font-size: 14px;
            padding-left: 8px;
        }
        position: relative;
        z-index: 2;
        user-select: none;
        cursor: pointer;
    }
}

.drop-inner {
    width: 100%;
    border-radius: 6px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 0 6px;

    &-container {
        padding: 6px;
    }
}

.list-item {
    display: flex;
    flex-direction: row;
    height: 24px;
    flex-shrink: 0;
    align-items: center;
    padding-left: 8px;
    padding-right: 12px;
    border-radius: 4px;
    user-select: none;
    cursor: pointer;
    gap: 8px;
    transition: all 0.3s;
    color: #828282;

    &:hover {
        background: #dbd9d9;
        padding-left: 12px;
    }

    &.on {
        background: #dbd9d9;
    }
}

.page-inner {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    user-select: none;
}

.left {
    transform: rotate(180deg);
}

.pointer {
    cursor: pointer;
}
.arrow-wrapper {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
