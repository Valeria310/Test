<template>
    <div class="cards-wrapper">
        <ReferenceBooks
            @setViewedProp="setViewedProp"
            @setViewedBook="setViewedBook"
        />
        <ViewedProps
            v-if="viewedProp"
            :viewedProp="viewedProp"
            @setViewedProp="setViewedProp"
        />
        <ViewedBook
            v-for="(book, i) in viewedPBooks"
            :key="i"
            :viewedBook="book"
            @removeBook="removeBook"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";
import ReferenceBooks from "@/components/ReferenceBooks.vue";
import ViewedProps from "@/components/ViewedProps.vue";
import ViewedBook from "@/components/ViewedBook.vue";

export default defineComponent({
    name: "MainView",
    components: {
        ReferenceBooks,
        ViewedProps,
        ViewedBook,
    },
    setup() {
        const viewedProp = ref<{ name: string; type: string; code: string }>();
        const viewedPBooks = ref<
            { name: string; type: string; code: string }[]
        >([]);

        function setViewedProp(prop?: {
            name: string;
            type: string;
            code: string;
        }) {
            viewedProp.value = prop;
        }

        function setViewedBook(
            vals: {
                name: string;
                type: string;
                code: string;
            }[]
        ) {
            viewedPBooks.value = [...vals];
        }

        function removeBook(code: string) {
            viewedPBooks.value = viewedPBooks.value.filter(
                (el) => el.code !== code
            );
        }

        return {
            viewedProp,
            viewedPBooks,
            setViewedProp,
            setViewedBook,
            removeBook,
        };
    },
});
</script>
<style lang="scss" scoped>
.cards-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>
