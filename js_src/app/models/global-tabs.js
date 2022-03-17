export const getGlobalTabs = (isImageLoaded, onclickFunc) => {
    const tabs = [
        { name: 'Open', },
        {
            name: 'Image',
            isDisabled: !isImageLoaded,
        },
        { name: 'Settings', },
        {
            name: 'Export',
            isDisabled: !isImageLoaded,
        },
    ];

    return tabs.map((tab) => {
        tab.clicked = tab.isDisabled ? () => {} : onclickFunc;
        return tab;
    });
};
