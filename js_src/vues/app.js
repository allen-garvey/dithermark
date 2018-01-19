(function(Vue, Fs, Canvas, Timer, WorkerUtil, WebGl, Polyfills, WorkerHeaders){
    
    var app = new Vue({
        el: '#app',
        components: {
            //'bw-dither-section': BwDitherComponent,
        },
        mounted: function(){
            this.sourceCanvas = Canvas.create('source-canvas');
            this.transformCanvas = Canvas.create('transform-canvas');
            this.transformCanvasWebGl = WebGl.createCanvas('transform-canvas-webgl');
            this.sourceCanvasOutput = Canvas.create('source-canvas-output');
            this.transformCanvasOutput = Canvas.create('transform-canvas-output');
        },
        data: {
            sourceCanvas: null,
            transformCanvas: null,
            transformCanvasWebGl: null,
            sourceCanvasOutput: null,
            transformCanvasOutput: null,
        },
        computed: {
            
        },
        watch: {
            
        },
        methods: {
            
        }
    });
    
    
    
    
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.WorkerUtil, App.WebGl, App.Polyfills, App.WorkerHeaders);