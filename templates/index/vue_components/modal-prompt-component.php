<div v-if="showModal" @keyup.esc="cancelAction" class="modal-layout-container">
    <div class="modal-overlay" @click="cancelAction"></div>
    <div class="modal-container">
        <label>{{labelValue}}
            <input ref="input" tabindex="1" :type="inputType" :placeholder="placeholder" v-model="inputValue" @keyup.enter="okAction" />
        </label>
        <div class="modal-buttons-container">
            <button class="btn btn-default" tabindex="2" @click="cancelAction">Cancel</button>
            <button class="btn btn-primary" tabindex="3" @click="okAction">{{okButtonValue}}</button>
        </div>
    </div>
</div>