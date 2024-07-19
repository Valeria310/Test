<template>
    <div class="input-wrapper" :class="{ disabled: isDisable }">
        <input
            type="text"
            class="input"
            :placeholder="placeholder"
            v-model="inputValue"
            :disabled="isDisable"
            @input="handleInput"
            @focusin="isFocused = true"
            @focusout="setIsFocusedToFalse"
        />
        <div v-if="results.length > 1 && isFocused" class="results">
            <div
                class="results-item"
                :class="{ active: res === activeItem }"
                v-for="res in results"
                :key="res"
                @click="setVal(res)"
            >
                {{ res }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    PropType,
    toRefs,
    ref,
    watch,
    onBeforeUnmount,
} from "@vue/composition-api";
import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";

Vue.use(VueCompositionAPI);

export default defineComponent({
    name: "AutoInput",
    props: {
        items: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
        placeholder: {
            type: String,
            default: "",
        },
        value: {
            type: String,
            default: "",
        },
        name: {
            type: String as PropType<"name" | "code">,
            required: true,
        },
        isDisable: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["onInput"],
    setup(props, { emit }) {
        const { items, placeholder, value, name } = toRefs(props);
        const isFocused = ref(false);
        const activeItem = ref("");
        const inputValue = ref(value.value);
        let lastInitValue = props.value;

        const results = computed<string[]>(() => {
            if (inputValue.value) {
                const res = items.value.filter((el) =>
                    String(el)
                        .toLowerCase()
                        .includes(inputValue.value.toLowerCase())
                );
                return res;
            } else {
                return [];
            }
        });

        function handleInput(e: Event) {
            const target = e.target as HTMLInputElement;
            activeItem.value = "";
            const index = props.items.findIndex((el) =>
                String(el).toLowerCase().includes(target.value.toLowerCase())
            );
            if (index !== -1) {
                emit("onInput", name.value, target.value.trim());
                lastInitValue = target.value;
            } else {
                inputValue.value = lastInitValue.trim();
            }
        }

        function setVal(val: string) {
            lastInitValue = val;
            inputValue.value = val;
            emit("onInput", name.value, val);
        }

        function setIsFocusedToFalse() {
            setTimeout(() => {
                isFocused.value = false;
                activeItem.value = "";
            }, 200);
        }

        function handleKeyPress(e: KeyboardEvent) {
            if (results.value.length <= 1) return;
            const curIndex = results.value.findIndex(
                (el) =>
                    el ===
                    (activeItem.value ? activeItem.value : inputValue.value)
            );
            let nextIndex = curIndex;
            if (e.key === "ArrowUp") {
                if (curIndex === -1 || curIndex < 1) {
                    nextIndex = results.value.length - 1;
                } else {
                    nextIndex = curIndex - 1;
                }
                activeItem.value = results.value[nextIndex];
            } else if (e.key === "ArrowDown") {
                if (curIndex === -1 || curIndex > results.value.length - 2) {
                    nextIndex = 0;
                } else {
                    nextIndex = curIndex + 1;
                }
                activeItem.value = results.value[nextIndex];
            } else if (e.key === "Enter") {
                if (activeItem.value) {
                    setVal(activeItem.value);
                    lastInitValue = activeItem.value;
                    inputValue.value = activeItem.value;
                    activeItem.value = "";
                }
            }
        }

        watch([results, isFocused], () => {
            if (results.value.length && (isFocused.value || activeItem.value)) {
                window.addEventListener("keyup", handleKeyPress);
            } else {
                activeItem.value = "";
                window.removeEventListener("keyup", handleKeyPress);
            }
        });

        watch(
            () => props.value,
            () => {
                if (!props.value) {
                    lastInitValue = "";
                    inputValue.value = "";
                }
            }
        );

        onBeforeUnmount(() => {
            window.removeEventListener("keyup", handleKeyPress);
        });

        return {
            results,
            isFocused,
            activeItem,
            inputValue,
            handleInput,
            setVal,
            setIsFocusedToFalse,
        };
    },
});
</script>
<style lang="scss" scoped>
.input-wrapper {
    width: 400px;
    height: 40px;
    border-radius: 6px;
    background: #ffffff;
    position: relative;
    box-shadow: 0px 6px 8px 0px rgba(34, 60, 80, 0.2);

    &.disabled {
        background: #cecece;
        width: 100%;

        & .input {
            color: #686868;
        }
    }
}

.input {
    width: 100%;
    height: 100%;
    outline: none;
    border: none;
    border-radius: 6px;
    background: transparent;
    padding: 0 10px;
    color: #828282;
}

input::placeholder {
    color: #c9c9c9;
}

.results {
    position: absolute;
    z-index: 2;
    width: 400px;
    border-radius: 6px;
    background: #ffffff;
    left: 0;
    box-shadow: 0px 0px 4px 0px #08253d;
    padding: 8px 6px;
    overflow-y: scroll;
    max-height: 400px;
    display: flex;
    flex-direction: column;

    &-item {
        border-radius: 4px;
        min-height: 24px;
        transition: all 0.3s;
        color: #828282;
        padding: 4px 0;
        padding-left: 8px;
        padding-right: 12px;
        user-select: none;
        cursor: pointer;
        border: 1px solid transparent;

        &:hover {
            background: #dbd9d9;
            padding-left: 12px;
            padding-right: 8px;
        }

        &.active {
            border-color: #828282;
        }
    }
}
</style>
