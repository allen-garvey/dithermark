<template>
    <div v-if="messages.length > 0" class="alert" :class="type">
        <ul :class="$style.bannerList">
            <li v-for="message in messages">
                {{ message }}
            </li>
        </ul>
    </div>
</template>

<style lang="scss" module>
.bannerList {
    padding: 0.5em 2em;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
}
</style>

<script>
export default {
    props: {
        messages: {
            type: Array,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
    },
};
</script>
