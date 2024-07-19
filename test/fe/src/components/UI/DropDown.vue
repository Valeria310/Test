<template>
    <div>
        <div class="relative flex" :class="{ disabled: isDisable }">
            <div
                class="group drop-container"
                ref="wrapperEl"
                :class="[{ on: isOpen }, { disabled: isDisable }]"
            >
                <div ref="triggerEl" class="flex">
                    <slot name="trigger-element" :onClick="onClick"></slot>
                </div>
                <ArrowIcon
                    @click="onClick"
                    :isBlack="true"
                    class="arrow"
                    :class="{ active: !isDisable }"
                />
                <transition name="fade-150">
                    <div
                        class="inner"
                        :class="topPositionClass"
                        v-if="isOpen"
                        ref="bodyEl"
                    >
                        <slot
                            name="body"
                            :isOpen="isOpen"
                            :onSelect="
                                () => {
                                    isOpen = false;
                                }
                            "
                        ></slot>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import ArrowIcon from "@/assets/ArrowIcon.vue";
import {
    defineComponent,
    ref,
    nextTick,
    onMounted,
} from "@vue/composition-api";
import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";

Vue.use(VueCompositionAPI);

export default defineComponent({
    name: "DropDown",
    components: {
        ArrowIcon,
    },
    props: {
        isDisable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const isOpen = ref(false);
        const wrapperEl = ref<HTMLElement | null>(null);
        const triggerEl = ref<HTMLElement | null>(null);
        const bodyEl = ref<HTMLElement | null>(null);
        const scrollableParent = ref<HTMLElement | null>(null);
        const topPositionClass = ref("top-full");

        function onClick() {
            if (props.isDisable) return;
            if (!isOpen.value && scrollableParent.value && triggerEl.value) {
                const parentBoundingRect =
                    scrollableParent.value.getBoundingClientRect();
                const triggerBoundingRect =
                    triggerEl.value.getBoundingClientRect();
                topPositionClass.value =
                    triggerBoundingRect.top -
                        parentBoundingRect.top +
                        triggerBoundingRect.height / 2 >
                    parentBoundingRect.height / 2
                        ? "bottom-full"
                        : "top-full";
            }
            isOpen.value = !isOpen.value;
            nextTick(() => {
                setTimeout(() => {
                    if (isOpen.value && bodyEl.value) {
                        const onEl = bodyEl.value.querySelector(
                            ".on"
                        ) as HTMLElement;
                        const onElScrollParent = getScrollParent(onEl);
                        if (!onElScrollParent || !onEl) return;
                    }
                }, 0);
            });
        }

        function onClickOutside(event: MouseEvent) {
            if (
                wrapperEl.value &&
                !wrapperEl.value.contains(event.target as Node)
            ) {
                isOpen.value = false;
            }
        }

        function onEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                isOpen.value = false;
            }
        }

        function getScrollParent(node: HTMLElement | null): HTMLElement | null {
            if (node == null) {
                return null;
            }

            if (node.scrollHeight > node.clientHeight) {
                return node;
            } else {
                return getScrollParent(node.parentElement);
            }
        }

        onMounted(() => {
            if (wrapperEl.value) {
                scrollableParent.value = getScrollParent(wrapperEl.value);
            }
            document.addEventListener("click", onClickOutside);
            document.addEventListener("keydown", onEscape);
        });

        return {
            isOpen,
            wrapperEl,
            triggerEl,
            bodyEl,
            scrollableParent,
            topPositionClass,
            onClick,
            onClickOutside,
            onEscape,
            getScrollParent,
        };
    },
});
</script>
<style lang="scss" scoped>
.relative {
    position: relative;
}
.flex {
    display: flex;

    &.disabled {
        display: block;
        width: 100%;
    }
}
.inner {
    position: absolute;
    left: 0;
    min-width: 100%;
    box-shadow: 0px 0px 4px 0px #08253d;
    border-radius: 6px;
    z-index: 1;
}
.top-full {
    top: 100%;
}
.bottom-full {
    bottom: 100%;
}

.drop-container {
    position: relative;
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 6px;

    &.disabled {
        background: #cecece;
    }
}

.arrow {
    position: absolute;
    right: 5px;
    transform: rotate(90deg);
}

.group {
    & .arrow.active {
        transition: all 0.3s;
    }

    &:hover .arrow.active {
        transform: rotate(180deg);
    }

    &.on .arrow.active {
        transform: rotate(270deg);
    }
}
</style>
