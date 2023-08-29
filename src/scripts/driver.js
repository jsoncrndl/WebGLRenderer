
Rendering.main = (function() {
    'use strict';
    let contentLoaded = false;
    let previousTime = performance.now();

    Rendering.gameModel.loadContent().then(() => {
        Rendering.gameModel.initialize();
        contentLoaded = true;
        requestAnimationFrame(animationLoop);
    });

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        Rendering.gameModel.update(elapsedTime / 1000);
    } 

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        Rendering.gameModel.render();
    }

    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {
        let elapsedTime = time - previousTime;
        previousTime = time;

        update(elapsedTime);
        render();

        requestAnimationFrame(animationLoop);
    }

    console.log('initializing...');
}());
