<template>
    <div class="form-inner">
        <DropDown v-if="types" class="drop-main">
            <template #trigger-element="{ onClick }">
                <button class="drop-main-button" @click="onClick">
                    <div
                        class="drop-main-button-inner"
                        :class="{ default: !selectedType }"
                    >
                        {{ selectedType || "Тип справочника" }}
                    </div>
                </button>
            </template>
            <template #body="{ isOpen, onSelect }">
                <div class="drop-inner" v-if="isOpen">
                    <div class="drop-inner-container">
                        <div
                            v-for="action in types"
                            :key="action"
                            class="list-item"
                            :class="{ on: selectedType === action }"
                            @click="
                                () => {
                                    selectedType = action;
                                    onSelect();
                                }
                            "
                        >
                            {{ action }}
                        </div>
                    </div>
                </div>
            </template>
        </DropDown>
        <AutoInput
            v-if="names"
            :items="names"
            :placeholder="'Наименование справочника'"
            :value="name"
            :name="'name'"
            @onInput="handleInput"
        />
        <AutoInput
            v-if="codes"
            :items="codes"
            :placeholder="'Код справочника'"
            :value="code"
            :name="'code'"
            @onInput="handleInput"
        />
        <input
            v-if="needToReqDate"
            class="date"
            type="date"
            name="dateFrom"
            id="curDateFrom"
            v-model="curDateFrom"
            :max="curDateTo"
        />
        <input
            v-if="needToReqDate"
            class="date"
            type="date"
            name="dateTo"
            id="curDateTo"
            v-model="curDateTo"
            :min="curDateFrom"
        />
        <div class="btns-wrapper">
            <div class="btn" @click="cleanForm">Очистить форму</div>
            <div class="btn" @click="handleSearch">Поиск</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "@vue/composition-api";
import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import DropDown from "@/components/UI/DropDown.vue";
import AutoInput from "@/components/UI/AutoInput.vue";

Vue.use(VueCompositionAPI);

export default defineComponent({
    name: "SearchForm",
    props: {
        types: {
            type: Array as PropType<string[] | null>,
            default: () => null,
            required: false,
        },
        names: {
            type: Array as PropType<string[] | null>,
            default: () => null,
            required: false,
        },
        codes: {
            type: Array as PropType<string[] | null>,
            default: () => null,
            required: false,
        },
        needToReqDate: {
            type: Boolean,
            required: false,
        },
    },
    emits: ["search"],
    setup(props, { emit }) {
        const selectedType = ref<string | null>(null);
        const name = ref("");
        const code = ref("");
        const curDateFrom = ref<Date>();
        const curDateTo = ref<Date>();

        function handleInput(target: "name" | "code", value: string) {
            switch (target) {
                case "name":
                    name.value = value;
                    break;
                case "code":
                    code.value = value;
                    break;
                default:
                    break;
            }
        }

        function cleanForm() {
            selectedType.value = null;
            name.value = "";
            code.value = "";
        }

        function handleSearch() {
            if (props.types) {
                emit(
                    "search",
                    selectedType.value || "",
                    name.value,
                    code.value
                );
            } else {
                emit(
                    "search",
                    name.value,
                    code.value,
                    curDateFrom.value,
                    curDateTo.value
                );
            }
        }

        return {
            selectedType,
            name,
            code,
            curDateFrom,
            curDateTo,
            handleInput,
            cleanForm,
            handleSearch,
        };
    },
    components: {
        DropDown,
        AutoInput,
    },
});
</script>

<style lang="scss" scoped>
.form-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.drop-main {
    display: table-cell;
    font-size: 14px;
    box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);

    &-button {
        border-radius: 4px;
        height: 40px;
        width: 400px;
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

            &.default {
                color: #c9c9c9;
            }
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

.btns-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.date {
    width: 400px;
    height: 40px;
    box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);
    border-radius: 6px;
    background: #ffffff;
    border: none;
    outline: none;
    padding: 0 10px;
}
</style>
