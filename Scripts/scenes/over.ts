/**
 * @module scenes
 */
module scenes {
    /**
     * This class instantiates the game over scene object
     * 
     * @class Over
     * @extends scenes.Scene
     */
    export class Over extends scenes.Scene {
        private _blocker: HTMLElement;
        private _stage: createjs.Stage;
        private _gameOverLabel: createjs.Text;
        private _scoreLabel: createjs.Text;
        private _highScoreLabel: createjs.Text;
        private _restartButton: createjs.Bitmap;
        
        private spotLight: SpotLight;
        
        private groundGeometry: CubeGeometry;
        private groundPhysicsMaterial: Physijs.Material;
        private groundMaterial: PhongMaterial;
        private ground: Physijs.Mesh;
        private groundTexture: Texture;
        private groundTextureNormal: Texture;
        
        private coinGeometry: Geometry;
        private coinMaterial: Physijs.Material;
        private coins: Physijs.ConcaveMesh[];
        private coinCount: number;
        
        /**
         * Empty Contructor
         * 
         * @constructor
         */
        constructor() {
            super();

            this._initialize();
            this.start();
        }

        /**
         * Sets up a reference to the canvas HTML Element
         * 
         * @method _setupCanvas
         * @return void
         */
        private _setupCanvas(): void {
            canvas.style.width = "100%";
            canvas.setAttribute("height", config.Screen.HEIGHT.toString());
            canvas.style.backgroundColor = "#ffffff";
            canvas.style.opacity = "0.8";
            canvas.style.position = "absolute";
        }

        /**
         * This method sets up default values for class member variables
         * and objects
         * 
         * @method _initialize
         * @return void
         */
        private _initialize(): void {
            // Create to HTMLElements
            this._blocker = document.getElementById("blocker");
            this._blocker.style.display = "none";

            // setup canvas for menu scene
            this._setupCanvas();
            // setup a stage on the canvas
            this._stage = new createjs.Stage(canvas);
            this._stage.enableMouseOver(20);
            
            this.coinCount = 20;
        }

        /**
         * Add a spotLight to the scene
         * 
         * @method addSpotLight
         * @return void
         */
        private addSpotLight(): void {
            // Spot Light
            this.spotLight = new SpotLight(0xffffff);
            this.spotLight.position.set(20, 40, -15);
            this.spotLight.castShadow = true;
            this.spotLight.intensity = 2;
            this.spotLight.lookAt(new Vector3(0, 0, 0));
            this.spotLight.shadowCameraNear = 2;
            this.spotLight.shadowCameraFar = 200;
            this.spotLight.shadowCameraLeft = -5;
            this.spotLight.shadowCameraRight = 5;
            this.spotLight.shadowCameraTop = 5;
            this.spotLight.shadowCameraBottom = -5;
            this.spotLight.shadowMapWidth = 2048;
            this.spotLight.shadowMapHeight = 2048;
            this.spotLight.shadowDarkness = 0.5;
            this.spotLight.name = "Spot Light";
            this.add(this.spotLight);
            console.log("Added spotLight to scene");
        }

        /**
         * Add a ground plane to the scene
         * 
         * @method addGround
         * @return void
         */
        private addGround(): void {
            this.groundTexture = new THREE.TextureLoader().load('../../Assets/images/GravelCobble.jpg');
            this.groundTexture.wrapS = THREE.RepeatWrapping;
            this.groundTexture.wrapT = THREE.RepeatWrapping;
            this.groundTexture.repeat.set(8, 8);

            this.groundTextureNormal = new THREE.TextureLoader().load('../../Assets/images/GravelCobbleNormal.png');
            this.groundTextureNormal.wrapS = THREE.RepeatWrapping;
            this.groundTextureNormal.wrapT = THREE.RepeatWrapping;
            this.groundTextureNormal.repeat.set(8, 8);

            this.groundMaterial = new PhongMaterial();
            this.groundMaterial.map = this.groundTexture;
            this.groundMaterial.bumpMap = this.groundTextureNormal;
            this.groundMaterial.bumpScale = 0.2;

            this.groundGeometry = new BoxGeometry(32, 1, 32);
            this.groundPhysicsMaterial = Physijs.createMaterial(this.groundMaterial, 0, 0);
            this.ground = new Physijs.ConvexMesh(this.groundGeometry, this.groundPhysicsMaterial, 0);
            this.ground.receiveShadow = true;
            this.ground.name = "Ground";
            this.add(this.ground);
            console.log("Added Ground to scene");
        }
        
        /**
         * This method adds a coin to the scene
         * 
         * @method addCoinMesh
         * @return void
         */
        private addCoinMesh(): void {
            var self = this;

            this.coins = new Array<Physijs.ConvexMesh>(); // Instantiate a convex mesh array

            var coinLoader = new THREE.JSONLoader().load("../../Assets/imported/coin.json", function(geometry: THREE.Geometry) {
                var phongMaterial = new PhongMaterial({ color: 0xE7AB32 });
                phongMaterial.emissive = new THREE.Color(0xE7AB32);

                var coinMaterial = Physijs.createMaterial((phongMaterial), 0.4, 0.6);

                for (var count: number = 0; count < self.coinCount; count++) {
                    self.coins[count] = new Physijs.ConvexMesh(geometry, coinMaterial);
                    self.coins[count].receiveShadow = true;
                    self.coins[count].castShadow = true;
                    self.coins[count].name = "Coin";
                    self.setCoinPosition(self.coins[count]);
                    console.log("Added Coin " + count + " to the Scene");
                }
            });
        }
        
        /**
         * This method randomly sets the coin object's position
         * 
         * @method setCoinPosition
         * @return void
         */
        private setCoinPosition(coin: Physijs.ConvexMesh): void {
            var randomPointX: number = Math.floor(Math.random() * 20) - 10;
            var randomPointY: number = Math.floor(Math.random() * 30) + 1;
            var randomPointZ: number = Math.floor(Math.random() * 20) - 10;
            coin.position.set(randomPointX, randomPointY, randomPointZ);
            this.add(coin);
        }

        // PUBLIC METHODS +++++++++++++++++++++++++++++++++++++++++

        /**
         * The start method is the main method for the scene class
         * 
         * @method start
         * @return void
         */
        public start(): void {
            // Scene changes for Physijs
            this.name = "Game Over Scene";
            this.fog = new THREE.Fog(0xffffff, 0, 750);
            this.setGravity(new THREE.Vector3(0, -10, 0));
            var self = this;
            
            //check for high score changes
            if(scoreValue > highScoreValue) {
                highScoreValue = scoreValue;
            }
            
            this._gameOverLabel = new createjs.Text(
                "GAME OVER",
                "80px Consolas",
                "#000000");
            this._gameOverLabel.regX = this._gameOverLabel.getMeasuredWidth() * 0.5;
            this._gameOverLabel.regY = this._gameOverLabel.getMeasuredLineHeight() * 0.5;
            this._gameOverLabel.x = config.Screen.WIDTH * 0.5;
            this._gameOverLabel.y = (config.Screen.HEIGHT * 0.5) - 100;
            this._stage.addChild(this._gameOverLabel);
            
            this._scoreLabel = new createjs.Text(
                "Your Score: " + scoreValue,
                "40px Consolas",
                "#000000");
            this._scoreLabel.regX = this._scoreLabel.getMeasuredWidth() * 0.5;
            this._scoreLabel.regY = this._scoreLabel.getMeasuredLineHeight() * 0.5;
            this._scoreLabel.x = config.Screen.WIDTH * 0.5;
            this._scoreLabel.y = config.Screen.HEIGHT * 0.5;
            this._stage.addChild(this._scoreLabel);
            
            this._highScoreLabel = new createjs.Text(
                "High Score: " + highScoreValue,
                "40px Consolas",
                "#000000");
            this._highScoreLabel.regX = this._highScoreLabel.getMeasuredWidth() * 0.5;
            this._highScoreLabel.regY = this._highScoreLabel.getMeasuredLineHeight() * 0.5;
            this._highScoreLabel.x = config.Screen.WIDTH * 0.5;
            this._highScoreLabel.y = (config.Screen.HEIGHT * 0.5) + 50;
            this._stage.addChild(this._highScoreLabel);

            this._restartButton = new createjs.Bitmap(assets.getResult("RestartButton"));
            this._restartButton.regX = this._restartButton.getBounds().width * 0.5;
            this._restartButton.regY = this._restartButton.getBounds().height * 0.5;
            this._restartButton.x = config.Screen.WIDTH * 0.5;
            this._restartButton.y = (config.Screen.HEIGHT * 0.5) + 150;
            this._stage.addChild(this._restartButton);

            this._restartButton.on("mouseover", (event: createjs.MouseEvent) => {
                event.target.alpha = 0.7;
            });

            this._restartButton.on("mouseout", (event: createjs.MouseEvent) => {
                event.target.alpha = 1.0;
            });

            this._restartButton.on("click", (event: createjs.MouseEvent) => {
                currentScene = config.Scene.PLAY;
                changeScene();
            });
            
            // Add Spot Light to the scene
            this.addSpotLight();

            // Ground Object
            this.addGround();
            
            // Add custom coin imported from Blender
            this.addCoinMesh();
            
            this.ground.addEventListener('collision', function(eventObject){
                if (eventObject.name === "Coin") {
                    var coinSound: createjs.AbstractSoundInstance = createjs.Sound.play("coin");
                    coinSound.volume = 0.1;
                    
                    self.remove(eventObject);
                    self.setCoinPosition(eventObject);
                }
            });
            
            camera.position.set(0, 10, -20);
            camera.lookAt(new Vector3(0, 0, 0));  
        }

        /**
         * The update method updates the animation loop and other objects
         * 
         * @method update
         * @return void
         */
        public update(): void {
             this.coins.forEach(coin => {
                coin.setAngularFactor(new Vector3(0, 0, 0));
                coin.setAngularVelocity(new Vector3(0, 1, 0));
            });
            
            this._stage.update();
            
            this.simulate();
        }

        /**
         * The resize method is a procedure that sets variables and objects on screen resize
         * 
         * @method resize
         * @return void
         */
        public resize(): void {
            this._setupCanvas();
        }

    }
}