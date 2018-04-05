// aframe-button-controller.js - lowest common denominator controller support for A-Frame (just buttons)
// Copyright © 2018 by P. Douglas Reeder under the MIT License

function GamepadButtonEvent (type, controllerId, index, details) {
    this.type = type;
    this.controllerId = controllerId;
    this.index = index;
    this.pressed = details.pressed;
    this.value = details.value;
}


AFRAME.registerComponent('button-controls', {
    schema: {
        enabled: { default: true },
        debug: { default: false }
    },

    init: function () {
        this.buttons = {};   // keys are controller ids, values are array of booleans

        if (this.data.debug) {
            console.log("button-controls init - this.data:", this.data);
            window.addEventListener('vrdisplaypresentchange', (event) => {
                console.log("vrdisplaypresentchange", event.display.isPresenting);
                this.gamepadsListed = false;
            });
            window.addEventListener("gamepadconnected", function (e) {
                console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                    e.gamepad.index, e.gamepad.id,
                    e.gamepad.buttons.length, e.gamepad.axes.length);
            });
            window.addEventListener("gamepaddisconnected", function(e) {
                console.log("Gamepad disconnected from index %d: %s",
                    e.gamepad.index, e.gamepad.id);
            });
        }

        if (this.data.debug && ! this.gamepadsListed) {
            let gamepads = navigator.getGamepads();
            console.log("gamepads:", gamepads);
        }
    },

    // update: function () {
    //     this.data
    //     this.el
    // },

    tick: function (time, deltaTime) {
        if (this.data.enabled) {
            let gamepads = navigator.getGamepads();
            for (let i=0; i<gamepads.length; ++i) {
                let gamepad = gamepads[i];
                if (gamepad) {
                    if (this.buttons[gamepad.id]) {
                        for (let j=0; j<gamepad.buttons.length; ++j) {
                            let buttonPressed = gamepad.buttons[j].pressed;
                            let oldButtonPressed = this.buttons[gamepad.id][j];
                            if (buttonPressed && ! oldButtonPressed) {
                                this.el.emit('buttondown', new GamepadButtonEvent('buttondown', gamepad.id, j, gamepad.buttons[j]));
                            } else if (!buttonPressed && oldButtonPressed) {
                                this.el.emit('buttonup', new GamepadButtonEvent('buttonup', gamepad.id, j, gamepad.buttons[j]));
                            }
                            this.buttons[gamepad.id][j] = buttonPressed;
                        }
                    } else {
                        if (this.data.debug) {
                            console.log("setting up gamepad", gamepad.id, gamepad.buttons);
                        }

                        let buttonsPressed = [];
                        for (let j=0; j<gamepad.buttons.length; ++j) {
                            buttonsPressed.push(gamepad.buttons[j].pressed)
                        }
                        this.buttons[gamepad.id] = buttonsPressed;
                    }
                }
            }
            this.gamepadsListed = true;
        }
    },

    remove: function () {

    }
});