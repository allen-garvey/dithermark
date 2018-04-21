<div v-show="showModal" @keyup.esc="cancelAction" class="modal-layout-container">
    <div class="modal-overlay" @click="cancelAction"></div>
    <div class="modal-container">
        <label>{{labelValue}}
            <input :type="inputType" :placeholder="placeholder" v-model="inputValue" @keyup.enter="okAction" />
        </label>
        <div class="modal-buttons-container">
            <button @click="cancelAction">Cancel</button>
            <button @click="okAction">{{okButtonValue}}</button>
        </div>
    </div>
</div>