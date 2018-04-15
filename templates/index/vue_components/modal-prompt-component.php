<div v-show="showModal" @keyup.esc="cancelAction" class="modal-layout-container">
    <div class="modal-overlay" @click="cancelAction"></div>
    <div class="modal-container">
        <label>Palette name
            <input type="text" v-model="paletteName" @keyup.enter="okAction" />
        </label>
        <div class="modal-buttons-container">
            <button @click="cancelAction">Cancel</button>
            <button @click="okAction">Save</button>
        </div>
    </div>
</div>