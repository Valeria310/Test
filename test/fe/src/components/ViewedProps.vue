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
            Создание/Редактирование справочника
            <ArrowIcon class="arrow" />
        </div>
        <div
            ref="mainEl"
            class="block-main"
            :class="{ open: isOpen }"
            :style="{ top: isOpen ? 0 : `-${elHeight}px` }"
        >
            <div class="table">
                <div class="table-header">Паспорт справочника</div>
                <div class="table-body">
                    <div class="item-wrapper w-full">
                        <div class="item-name">Наименование &#8432;</div>
                        <AutoInput
                            :items="[]"
                            :value="viewedProp.name"
                            :name="'name'"
                            :isDisable="true"
                        />
                    </div>
                    <div
                        class="item-wrapper"
                        :style="{ width: 'calc(50% - 20px)' }"
                    >
                        <div class="item-name">Тип &#8432;</div>
                        <DropDown class="drop-main" :isDisable="true">
                            <template #trigger-element="{ onClick }">
                                <button
                                    class="drop-main-button"
                                    @click="onClick"
                                >
                                    <div class="drop-main-button-inner">
                                        {{ viewedProp.type }}
                                    </div>
                                </button>
                            </template>
                        </DropDown>
                    </div>
                    <div
                        class="item-wrapper"
                        :style="{ width: 'calc(50% - 20px)' }"
                    >
                        <div class="item-name">Код &#8432;</div>
                        <AutoInput
                            :items="[]"
                            :value="viewedProp.code"
                            :name="'code'"
                            :isDisable="true"
                        />
                    </div>
                </div>
            </div>
            <div class="btn close-btn" @click="handleClose">Закрыть</div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
    ref,
    onMounted,
    PropType,
} from "@vue/composition-api";
import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import ArrowIcon from "@/assets/ArrowIcon.vue";
import AutoInput from "@/components/UI/AutoInput.vue";
import DropDown from "@/components/UI/DropDown.vue";

Vue.use(VueCompositionAPI);

export default defineComponent({
    name: "ViewedProps",
    props: {
        viewedProp: {
            type: Object as PropType<{
                name: string;
                type: string;
                code: string;
            }>,
            required: true,
        },
    },
    emits: ["setViewedProp"],
    setup(props, { emit }) {
        const isOpen = ref(true);
        const elHeight = ref(0);
        const headerHeight = 60;
        const mainEl = ref<HTMLElement | null>(null);

        function handleClose() {
            emit("setViewedProp");
        }

        onMounted(() => {
            setTimeout(() => {
                if (mainEl.value) {
                    elHeight.value = mainEl.value.offsetHeight;
                }
            }, 100);
        });

        return {
            isOpen,
            elHeight,
            headerHeight,
            mainEl,
            handleClose,
        };
    },
    components: {
        ArrowIcon,
        AutoInput,
        DropDown,
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

.table {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);

    &-header {
        height: 60px;
        background: #648194;
        border-radius: 8px;
        font-size: 18px;
        padding: 20px;
        color: #fcf8f3;
        user-select: none;
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &-body {
        padding: 40px 30px;
        display: flex;
        flex-wrap: wrap;
        gap: 40px;
    }
}

.item-wrapper {
    position: relative;
}

.item-name {
    position: absolute;
    color: #6c6c6c;
    left: 4px;
    z-index: 2;
    font-size: 12px;
    top: -12px;
}

.w-full {
    width: 100%;
}

.drop-main {
    display: flex;
    font-size: 14px;
    box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);
    width: 100%;
    border-radius: 4px;

    &-button {
        border-radius: 4px;
        height: 40px;
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
</style>
