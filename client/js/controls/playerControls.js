const playerControls = (() => {
    let keys = {};
    let movement = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        run: false
    };

    const init = () => {
        window.addEventListener('keydown', (event) => {
            keys[event.code] = true;
            updateMovement();
        });

        window.addEventListener('keyup', (event) => {
            keys[event.code] = false;
            updateMovement();
        });
    };

    const updateMovement = () => {
        movement.forward = keys['KeyW'];
        movement.backward = keys['KeyS'];
        movement.left = keys['KeyA'];
        movement.right = keys['KeyD'];
        movement.jump = keys['Space'];
        movement.run = keys['ShiftLeft'];
    };

    const getMovement = () => {
        return movement;
    };

    return {
        init,
        getMovement
    };
})();

export default playerControls;