<?php //inline styles only, since we are only including this component in debug builds ?>
<div style="display:inline-block;">
    <button class="btn btn-default btn-sm" @click="printPalette" title="Print current color palette to console">Print</button>
    <?php //can't have textarea display: none, or copying won't work ?>
    <textarea ref="copyTextarea" style="position: absolute;right: 100000px;"></textarea>
</div>