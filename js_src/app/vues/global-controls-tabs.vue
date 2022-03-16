<template>
    <div :class="$style.tabsContainer">
        <button 
            v-for="(tab, index) in globalControlsTabs" 
            :key="index"
            :class="{[$style.tab]: true, [$style.active]: activeControlsTab === index, [$style.disabled]: tab.isDisabled}" 
            @click="setActiveControlsTab(index, tab.isDisabled)"
            :disabled="tab.isDisabled || activeControlsTab === index"
        >
            {{tab.name}}
        </button>
    </div>
</template>

<style lang="scss" module>
    // Tabs
    // based on bootstrap v4 tabs
    // https://getbootstrap.com/docs/4.0/components/navs/
    .tabsContainer{
        display: flex;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 24px;
        
        .tab{
            // reset button element styles
            background-color: transparent;
            font-size: 1rem;
            color: var(--main-text-color);
            // tab styles
            cursor: pointer;
            padding: 1em 0.75em 0.75em;
            border: 1px solid transparent;
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
            margin-bottom: -1px; //to hide bottom border under active tab
            
            &.active{
                cursor: auto;
                border-color: var(--border-color);
                border-bottom-color: var(--main-bg-color);
            }
            // separate class from disabled property, since if tab is active disabled attribute is added
            // since you can't click on it, but doesn't have disabled class
            &.disabled{
                cursor: not-allowed;
                color: var(--disabled-text-color);
            }
        }
    }

    @include pinned_controls_mq{
        .tabsContainer{
            .tab{
                &.active{
                    border-color: var(--pinned-controls-border-color);
                    border-bottom-color: var(--pinned-controls-bg-color);
                }
            }
        }
    }
</style>

<script>
export default {
    props: {
        isImageLoaded: {
            type: Boolean,
            required: true,
        },
        activeControlsTab: {
            type: Number,
            required: true,
        },
        setActiveControlsTab: {
            type: Function,
            required: true,
        },
    },
    computed: {
        globalControlsTabs(){
            const tabs = [
                {name: 'Open'},
                {name: 'Image'},
                {name: 'Settings'},
                {name: 'Export'},
            ];
            if(!this.isImageLoaded){
                tabs[1].isDisabled = true;
                tabs[3].isDisabled = true;
            }

            return tabs;
        },
    },
};
</script>