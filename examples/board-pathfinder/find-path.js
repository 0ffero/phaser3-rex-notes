import BoardPlugin from 'rexPlugins/board-plugin.js';

class Demo extends Phaser.Scene {
    constructor() {
        super({
            key: 'examples'
        })
    }

    preload() {}

    create() {
        var graphics = this.add.graphics({
            lineStyle: {
                width: 1,
                color: 0xffffff,
                alpha: 1
            }
        });
        var board = this.rexBoard.add.board({
                grid: getHexagonGrid(this),
                // grid: getQuadGrid(this),
                width: 8,
                height: 8
            })
            .forEachTileXY(function (tileXY, board) {
                var poly = board.getGridPolygon(tileXY.x, tileXY.y);
                graphics.strokePoints(poly.points, true);
            }, this);

        var key = 'shape';
        createGridPolygonTexture(board, key);

        var chessA = this.add.image(0, 0, key)
            .setTint(0x00CC00)
            .setDepth(1);
        chessA.pathFinder = this.rexBoard.add.pathFinder(chessA, {
            blockerTest: true
        });
        board.addChess(chessA, 0, 0, 0, true);

        var chessB = this.add.image(0, 0, key)
            .setTint(0x005500);
        board.addChess(chessB, 7, 7, 0, true);

        var emptyTileXY, blocker;

        // add some blockers
        for (var i = 0; i < 10; i++) {
            blocker = this.add.image(0, 0, key).setTint(0x555555);
            emptyTileXY = board.getRandomEmptyTileXY(0);
            board.addChess(blocker, emptyTileXY.x, emptyTileXY.y, 0, true);
            blocker.rexChess.setBlocker();
        }

        // add chess
        var endTileXY = chessB.rexChess.tileXYZ;
        var tileXYArray = chessA.pathFinder.findPath(endTileXY),
            tileXY;
        for (var i = 0, cnt = tileXYArray.length; i < cnt; i++) {
            tileXY = tileXYArray[i];
            this.add.text(board.tileXYToWorldX(tileXY.x, tileXY.y),
                    board.tileXYToWorldY(tileXY.x, tileXY.y),
                    tileXY.cost)
                .setOrigin(0.5);
        }

        // move along path
        chessA.moveTo = this.rexBoard.add.moveTo(chessA);
        chessA.moveTo.on('complete', function () {
            if (tileXYArray.length) {
                chessA.moveTo.moveTo(tileXYArray.shift());
            }
        });
        chessA.moveTo.moveTo(tileXYArray.shift());
    }
}

var getQuadGrid = function (scene) {
    var grid = scene.rexBoard.add.quadGrid({
        x: 400,
        y: 100,
        cellWidth: 100,
        cellHeight: 50,
        type: 1
    });
    return grid;
}

var getHexagonGrid = function (scene) {
    var staggeraxis = 'x';
    var staggerindex = 'odd';
    var grid = scene.rexBoard.add.hexagonGrid({
        x: 100,
        y: 100,
        size: 30,
        staggeraxis: staggeraxis,
        staggerindex: staggerindex
    })
    return grid;
};

var createGridPolygonTexture = function (board, key) {
    var poly = board.getGridPolygon();
    poly.left = 0;
    poly.top = 0;
    var scene = board.scene;
    scene.add.graphics()
        .fillStyle(0xffffff)
        .fillPoints(poly.points, true)
        .generateTexture(key, poly.width, poly.height)
        .destroy();
    return scene.textures.get(key);
}

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: Demo,
    plugins: {
        scene: [{
            key: 'rexBoard',
            plugin: BoardPlugin,
            mapping: 'rexBoard'
        }]
    }
};

var game = new Phaser.Game(config);