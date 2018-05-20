<div v-if="showModal" @keyup.esc="cancelAction" class="modal-layout-container">
    <div class="modal-overlay" @click="cancelAction"></div>
    <div class="modal-container">
        <label>{{labelValue}}
            <?php //trigger needs to be keydown and not keyup, since otherwise it will be triggered if modal is opened via enter key on button ?>
            <input ref="input" v-focus class="modal-input" tabindex="1" :type="inputType" :placeholder="placeholder" v-model="inputValue" @keydown.enter="okAction" />
        </label>
        <div class="modal-buttons-container">
            <button class="btn btn-default" tabindex="2" @click="cancelAction">Cancel</button>
            <button class="btn btn-primary" tabindex="3" @click="okAction" :disabled="!inputValue">{{okButtonValue}}</button>
        </div>
    </div>
</div>