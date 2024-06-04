// Rasgele bir sayı üreten fonksiyon
function rand(max) {
    return Math.floor(Math.random() * max);
  }
  
  // Diziyi karıştıran fonksiyon
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  // Bir sprite'ın parlaklığını değiştiren fonksiyon
  function changeBrightness(factor, sprite) {
    // Sanal bir canvas oluştur
    var virtCanvas = document.createElement("canvas");
    virtCanvas.width = 500;
    virtCanvas.height = 500;
    var context = virtCanvas.getContext("2d");
    context.drawImage(sprite, 0, 0, 500, 500);
  
    // Resmin piksel verilerini al
    var imgData = context.getImageData(0, 0, 500, 500);
  
    // Her pikselin RGB değerlerini faktörle çarp
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = imgData.data[i] * factor;
      imgData.data[i + 1] = imgData.data[i + 1] * factor;
      imgData.data[i + 2] = imgData.data[i + 2] * factor;
    }
    // Yeni piksel verileriyle resmi güncelle
    context.putImageData(imgData, 0, 0);
  
    // Yeni resmi bir Image nesnesine yerleştir
    var spriteOutput = new Image();
    spriteOutput.src = virtCanvas.toDataURL();
    virtCanvas.remove();
    return spriteOutput;
  }
  
  // Kazanma mesajını gösteren fonksiyon
  function displayVictoryMess(moves) {
    document.getElementById("moves").innerHTML = "You Moved " + moves + " Steps.";
    toggleVisablity("Message-Container");
  }
  
  // Görünürlüğü değiştiren fonksiyon
  function toggleVisablity(id) {
    if (document.getElementById(id).style.visibility == "visible") {
      document.getElementById(id).style.visibility = "hidden";
    } else {
      document.getElementById(id).style.visibility = "visible";
    }
  }
  
  // Labirent oluşturan constructor fonksiyonu
  function Maze(Width, Height) {
    var mazeMap;
    var width = Width;
    var height = Height;
    var startCoord, endCoord;
    var dirs = ["n", "s", "e", "w"];
    var modDir = {
      n: { y: -1, x: 0, o: "s" },
      s: { y: 1, x: 0, o: "n" },
      e: { y: 0, x: 1, o: "w" },
      w: { y: 0, x: -1, o: "e" }
    };
  
    // Haritayı döndüren metot
    this.map = function () {
      return mazeMap;
    };
  
    // Başlangıç koordinatını döndüren metot
    this.startCoord = function () {
      return startCoord;
    };
  
    // Bitiş koordinatını döndüren metot
    this.endCoord = function () {
      return endCoord;
    };
  
    // Harita oluşturan metot
    function genMap() {
      mazeMap = new Array(height);
      for (y = 0; y < height; y++) {
        mazeMap[y] = new Array(width);
        for (x = 0; x < width; ++x) {
          mazeMap[y][x] = { n: false, s: false, e: false, w: false, visited: false, priorPos: null };
        }
      }
    }
  
    // Labirenti oluşturan metot
    function defineMaze() {
      // İşlemin tamamlanıp tamamlanmadığını belirten flag
      var isComp = false;
      var move = false;
      var cellsVisited = 1;
      var numLoops = 0;
      var maxLoops = 0;
      var pos = { x: 0, y: 0 };
      var numCells = width * height;
  
      // İşlem tamamlanana kadar devam et
      while (!isComp) {
        move = false;
        mazeMap[pos.x][pos.y].visited = true;
  
        if (numLoops >= maxLoops) {
          shuffle(dirs);
          maxLoops = Math.round(rand(height / 8));
          numLoops = 0;
        }
        numLoops++;
  
        // Her yöne bak
        for (index = 0; index < dirs.length; index++) {
          var direction = dirs[index];
          var nx = pos.x + modDir[direction].x;
          var ny = pos.y + modDir[direction].y;
  
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            // Eğer gidebileceğimiz bir yön varsa
            if (!mazeMap[nx][ny].visited) {
              // Duvarı kır
              mazeMap[pos.x][pos.y][direction] = true;
              mazeMap[nx][ny][modDir[direction].o] = true;
  
              // Prior pozisyonu güncelle
              mazeMap[nx][ny].priorPos = pos;
              // Yeni pozisyona geç
              pos = { x: nx, y: ny };
              cellsVisited++;
              move = true;
              break;
            }
          }
        }
  
        // Eğer herhangi bir yöne gidilecek yer yoksa
        if (!move) {
          pos = mazeMap[pos.x][pos.y].priorPos;
        }
        // Eğer tüm hücreler ziyaret edildiyse işlem tamam
        if (numCells == cellsVisited) {
          isComp = true;
        }
      }
    }
  
    // Başlangıç ve bitiş noktalarını tanımlayan metot
    function defineStartEnd() {
      switch (rand(4)) {
        case 0:
          startCoord = { x: 0, y: 0 };
          endCoord = { x: height - 1, y: width - 1 };
          break;
        case 1:
          startCoord = { x: 0, y: width - 1 };
          endCoord = { x: height - 1, y: 0 };
          break;
        case 2:
          startCoord = { x: height - 1, y: 0 };
          endCoord = { x: 0, y: width - 1 };
          break;
        case 3:
          startCoord = { x: height - 1, y: width - 1 };
          endCoord = { x: 0, y: 0 };
          break;
      }
    }
  
    // Harita ve başlangıç/bitiş noktalarını oluştur
    genMap();
    defineStartEnd();
    defineMaze();
  }
  
  // Labirenti çizen fonksiyon
  function DrawMaze(Maze, ctx, cellsize, endSprite = null) {
    var map = Maze.map();
    var cellSize = cellsize;
    var drawEndMethod;
    ctx.lineWidth = cellSize / 40;
  
    this.redrawMaze = function (size) {
      cellSize = size;
      ctx.lineWidth = cellSize / 50;
      drawMap();
      drawEndMethod();
    };
  
    function drawCell(xCord, yCord, cell) {
      var x = xCord * cellSize;
      var y = yCord * cellSize;
  
      if (cell.n == false) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }
      if (cell.s === false) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.e === false) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.w === false) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
    }
  
    function drawMap() {
      for (x = 0; x < map.length; x++) {
        for (y = 0; y < map[x].length; y++) {
          drawCell(x, y, map[x][y]);
        }
      }
    }
  
    // Bitiş bayrağını çizen fonksiyon
    function drawEndFlag() {
      var coord = Maze.endCoord();
      var gridSize = 4;
      var fraction = cellSize / gridSize - 2;
      var colorSwap = true;
      for (let y = 0; y < gridSize; y++) {
        if (gridSize % 2 == 0) {
          colorSwap = !colorSwap;
        }
        for (let x = 0; x < gridSize; x++) {
          ctx.beginPath();
          ctx.rect(
            coord.x * cellSize + x * fraction + 4.5,
            coord.y * cellSize + y * fraction + 4.5,
            fraction,
            fraction
          );
          if (colorSwap) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          }
          ctx.fill();
          colorSwap = !colorSwap;
        }
      }
    }
  
    // Bitiş sprite'ını çizen fonksiyon
    function drawEndSprite() {
      var offsetLeft = cellSize / 50;
      var offsetRight = cellSize / 25;
      var coord = Maze.endCoord();
      ctx.drawImage(
        endSprite,
        2,
        2,
        endSprite.width,
        endSprite.height,
        coord.x * cellSize + offsetLeft,
        coord.y * cellSize + offsetLeft,
        cellSize - offsetRight,
        cellSize - offsetRight
      );
    }
  
    // Canvas'ı temizleyen fonksiyon
    function clear() {
      var canvasSize = cellSize * map.length;
      ctx.clearRect(0, 0, canvasSize, canvasSize);
    }
  
    // Bitiş metodu belirleniyor
    if (endSprite != null) {
      drawEndMethod = drawEndSprite;
    } else {
      drawEndMethod = drawEndFlag;
    }
    clear();
    drawMap();
    drawEndMethod();
  }
  
  // Oyuncu constructor fonksiyonu
  function Player(maze, c, _cellsize, onComplete, sprite = null) {
    var ctx = c.getContext("2d");
    var drawSprite;
    var moves = 0;
    drawSprite = drawSpriteCircle;
    if (sprite != null) {
      drawSprite = drawSpriteImg;
    }
    var player = this;
    var map = maze.map();
    var cellCoords = { x: maze.startCoord().x, y: maze.startCoord().y };
    var cellSize = _cellsize;
    var halfCellSize = cellSize / 2;
  
    this.redrawPlayer = function (_cellsize) {
      cellSize = _cellsize;
      drawSpriteImg(cellCoords);
    };
  
    // Çember şeklinde oyuncuyu çizen fonksiyon
    function drawSpriteCircle(coord) {
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.arc(
        (coord.x + 1) * cellSize - halfCellSize,
        (coord.y + 1) * cellSize - halfCellSize,
        halfCellSize - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
        onComplete(moves);
        player.unbindKeyDown();
      }
    }
  
    // Resim şeklinde oyuncuyu çizen fonksiyon
    function drawSpriteImg(coord) {
      var offsetLeft = cellSize / 50;
      var offsetRight = cellSize / 25;
      ctx.drawImage(
        sprite,
        0,
        0,
        sprite.width,
        sprite.height,
        coord.x * cellSize + offsetLeft,
        coord.y * cellSize + offsetLeft,
        cellSize - offsetRight,
        cellSize - offsetRight
      );
      if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
        onComplete(moves);
        player.unbindKeyDown();
      }
    }
  
    // Oyuncuyu temizleyen fonksiyon
    function removeSprite(coord) {
      var offsetLeft = cellSize / 50;
      var offsetRight = cellSize / 25;
      ctx.clearRect(
        coord.x * cellSize + offsetLeft,
        coord.y * cellSize + offsetLeft,
        cellSize - offsetRight,
        cellSize - offsetRight
      );
    }
  
    // Yön kontrolü yapan fonksiyon
    function check(e) {
      var cell = map[cellCoords.x][cellCoords.y];
      moves++;
      switch (e.keyCode) {
        case 65:
        case 37: // batı
          if (cell.w == true) {
            removeSprite(cellCoords);
            cellCoords = { x: cellCoords.x - 1, y: cellCoords.y };
            drawSprite(cellCoords);
          }
          break;
        case 87:
        case 38: // kuzey
          if (cell.n == true) {
            removeSprite(cellCoords);
            cellCoords = { x: cellCoords.x, y: cellCoords.y - 1 };
            drawSprite(cellCoords);
          }
          break;
        case 68:
        case 39: // doğu
          if (cell.e == true) {
            removeSprite(cellCoords);
            cellCoords = { x: cellCoords.x + 1, y: cellCoords.y };
            drawSprite(cellCoords);
          }
          break;
        case 83:
        case 40: // güney
          if (cell.s == true) {
            removeSprite(cellCoords);
            cellCoords = { x: cellCoords.x, y: cellCoords.y + 1 };
            drawSprite(cellCoords);
          }
          break;
      }
    }
  
    // Klavye event'lerini bağlayan fonksiyon
    this.bindKeyDown = function () {
      window.addEventListener("keydown", check, false);
    };
  
    // Klavye event'lerini kaldıran fonksiyon
    this.unbindKeyDown = function () {
      window.removeEventListener("keydown", check, false);
    };
  
    drawSprite(maze.startCoord());
  
    this.bindKeyDown();
  }
  
  var mazeCanvas = document.getElementById("mazeCanvas");
  var ctx = mazeCanvas.getContext("2d");
  var sprite;
  var finishSprite;
  var maze, draw, player;
  var cellSize;
  var difficulty;
  
  window.onload = function () {
    // Ekran boyutu alınıyor
    let viewWidth = $("#view").width();
    let viewHeight = $("#view").height();
    if (viewHeight < viewWidth) {
      ctx.canvas.width = viewHeight - viewHeight / 100;
      ctx.canvas.height = viewHeight - viewHeight / 100;
    } else {
      ctx.canvas.width = viewWidth - viewWidth / 100;
      ctx.canvas.height = viewWidth - viewWidth / 100;
    }
  
    // Sprite'ları yükle
    var completeOne = false;
    var completeTwo = false;
    var isComplete = () => {
      if (completeOne === true && completeTwo === true) {
        setTimeout(function () {
          makeMaze();
        }, 500);
      }
    };
    sprite = new Image();
    sprite.src = "./key.png" + "?" + new Date().getTime();
    sprite.setAttribute("crossOrigin", " ");
    sprite.onload = function () {
      sprite = changeBrightness(1.2, sprite);
      completeOne = true;
      isComplete();
    };
  
    finishSprite = new Image();
    finishSprite.src = "./home.png" + "?" + new Date().getTime();
    finishSprite.setAttribute("crossOrigin", " ");
    finishSprite.onload = function () {
      finishSprite = changeBrightness(1.1, finishSprite);
      completeTwo = true;
      isComplete();
    };
  };
  
  window.onresize = function () {
    // Ekran boyutu değiştiğinde
    let viewWidth = $("#view").width();
    let viewHeight = $("#view").height();
    if (viewHeight < viewWidth) {
      ctx.canvas.width = viewHeight - viewHeight / 100;
      ctx.canvas.height = viewHeight - viewHeight / 100;
    } else {
      ctx.canvas.width = viewWidth - viewWidth / 100;
      ctx.canvas.height = viewWidth - viewWidth / 100;
    }
    cellSize = mazeCanvas.width / difficulty;
    if (player != null) {
      draw.redrawMaze(cellSize);
      player.redrawPlayer(cellSize);
    }
  };
  
  // Labirent oluşturan fonksiyon
  function makeMaze() {
    if (player != undefined) {
      player.unbindKeyDown();
      player = null;
    }
    var e = document.getElementById("diffSelect");
    difficulty = e.options[e.selectedIndex].value;
    cellSize = mazeCanvas.width / difficulty;
    maze = new Maze(difficulty, difficulty);
    draw = new DrawMaze(maze, ctx, cellSize, finishSprite);
    player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite);
    if (document.getElementById("mazeContainer").style.opacity < "100") {
      document.getElementById("mazeContainer").style.opacity = "100";
    }
  }