<template>
    <input type="checkbox" :checked="value" @change="handleChange" />
</template>

<script lang="ts">
import { defineComponent, toRefs, ref, watch } from "@vue/composition-api";
import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";

Vue.use(VueCompositionAPI);

export default defineComponent({
    name: "CheckBox",
    props: {
        checked: {
            type: Boolean,
            default: false,
        },
        cantChange: {
            type: Boolean,
            default: false,
        },
        code: {
            type: String,
            require: true,
        },
    },
    emits: ["onChange"],
    setup(props, { emit }) {
        const { checked, cantChange } = toRefs(props);
        const value = ref(props.checked);
        let lastValue = props.checked;

        function handleChange(event: Event) {
            const target = event.target as HTMLInputElement;
            if (cantChange.value) {
                target.checked = lastValue;
            } else {
                value.value = target.checked;
                lastValue = target.checked;
                emit("onChange", target.checked, props.code);
            }
        }

        watch(
            () => props.checked,
            (newVal) => {
                if (newVal !== lastValue) {
                    value.value = newVal;
                    lastValue = newVal;
                }
            }
        );

        return {
            value,
            handleChange,
        };
    },
});
</script>
