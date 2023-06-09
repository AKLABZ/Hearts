window.addEventListener('load', () => {
  const canvasContainer = document.getElementById('canvasContainer');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const shapes = [];
  let textObj = null;
  const animateBtn = document.getElementById('animateBtn');
  let isAnimating = false;
  let animationInterval;

  const engine = Matter.Engine.create();
  const render = Matter.Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: canvasContainer.offsetWidth,
      height: canvasContainer.offsetHeight,
      wireframes: false
    }
  });

  const ground = Matter.Bodies.rectangle(
    canvasContainer.offsetWidth / 2,
    canvasContainer.offsetHeight,
    canvasContainer.offsetWidth,
    10,
    { isStatic: true }
  );
  Matter.World.add(engine.world, ground);

  const leftWall = Matter.Bodies.rectangle(
    0,
    canvasContainer.offsetHeight / 2,
    10,
    canvasContainer.offsetHeight,
    { isStatic: true }
  );
  const rightWall = Matter.Bodies.rectangle(
    canvasContainer.offsetWidth,
    canvasContainer.offsetHeight / 2,
    10,
    canvasContainer.offsetHeight,
    { isStatic: true }
  );
  const topWall = Matter.Bodies.rectangle(
    canvasContainer.offsetWidth / 2,
    0,
    canvasContainer.offsetWidth,
    10,
    { isStatic: true }
  );
  Matter.World.add(engine.world, [leftWall, rightWall, topWall]);

  canvas.addEventListener('mousedown', handleMouseDown);

  const clearCanvasBtn = document.getElementById('clearCanvasBtn');
  clearCanvasBtn.addEventListener('click', clearCanvas);

  const changeColorBtn = document.getElementById('changeColorBtn');
  changeColorBtn.addEventListener('click', changeColor);

  const changeTextColorBtn = document.getElementById('changeTextColorBtn');
  changeTextColorBtn.addEventListener('click', changeTextColor);

  const addTextBtn = document.getElementById('addTextBtn');
  addTextBtn.addEventListener('click', addText);
  animateBtn.addEventListener('click', toggleAnimation);

  const shapeButtons = document.getElementsByClassName('shape-button');
  for (let i = 0; i < shapeButtons.length; i++) {
    const shapeButton = shapeButtons[i];
    shapeButton.addEventListener('click', handleShapeButtonClick);
  }

  function handleShapeButtonClick(event) {
    const shapeType = event.target.dataset.shape;
    const x = canvasContainer.offsetWidth / 2;
    const y = canvasContainer.offsetHeight / 2;

    let shape;

    switch (shapeType) {
      case 'heart':
        shape = createHeart(x, y);
        break;
      case 'square':
        shape = createRectangle(x, y, 100, 100);
        break;
      case 'rectangle':
        shape = createRectangle(x, y, 150, 100);
        break;
      case 'circle':
        shape = createCircle(x, y, 50);
        break;
      case 'halfcircle':
        shape = createHalfCircle(x, y, 50);
        break;
      default:
        break;
    }

    if (shape) {
      shapes.push(shape);
      Matter.World.add(engine.world, shape.body);
      update();
    }
  }

  function toggleAnimation() {
    if (isAnimating) {
      stopAnimation();
    } else {
      startAnimation();
    }
  }
  
    function startAnimation() {
      isAnimating = true;
      animateBtn.textContent = 'Stop Animation'
      animationInterval = setInterval(changeColors, 1000);
    }
  
    function stopAnimation() {
      isAnimating = false;
      animateBtn.textContent = 'Animate';
      clearInterval(animationInterval)
    }
  
    function changeColors() {
      changeColor();
      changeTextColor();
    }
    
    function clearCanvas() {
      const hearts = shapes.filter(shape => shape !== textObj);
      shapes.length = 0;
      shapes.push(textObj);
      Matter.World.remove(engine.world, hearts.map(heart => heart.body));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    
    function changeColor() {
      for (let i = 0; i < shapes.length; i++) {
        if (shapes[i] !== textObj) {
          shapes[i].color = getRandomColor();
        }
      }
    }
  
    function changeTextColor() {
      if (textObj) {
        textObj.colors = getRandomColors(textObj.text.length);
      }
    }
  
    function addText() {
      const textInput = document.getElementById('textInput');
      const text = textInput.value || 'itsaverykane';
  
      const fontSize = 100;
      const colors = getRandomColors(text.length);
      const x = canvasContainer.offsetWidth / 2;
      const y = canvasContainer.offsetHeight / 2 + fontSize / 2;
  
      if (textObj) {
        Matter.World.remove(engine.world, textObj.body);
        shapes.splice(shapes.indexOf(textObj), 1);
      }
  
      textObj = {
        x: x - ctx.measureText(text).width / 2,
        y: y,
        text: text,
        fontSize: fontSize,
        colors: colors,
        body: Matter.Bodies.rectangle(
          x,
          y,
          text.length * fontSize * 0.75,
          fontSize,
          {
            isSensor: false,
            isStatic: true
          }
        )
      };
  
      shapes.push(textObj);
      Matter.World.add(engine.world, textObj.body);
  
      textInput.value = '';
      update();
    }
  
    function handleMouseDown(event) {
      const x = event.clientX - canvas.getBoundingClientRect().left;
      const y = event.clientY - canvas.getBoundingClientRect().top;
  
      const heart = createHeart(x, y);
      shapes.push(heart);
  
      Matter.World.add(engine.world, heart.body);
  
      update();
    }
  
    function createHeart(x, y) {
      const width = getRandomValue(100, 150);
      const height = getRandomValue(100, 150);
      const angle = getRandomValue(0, Math.PI * 5);
      const heart = {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        color: getRandomColor(),
        body: Matter.Bodies.fromVertices(x, y, [
          { x: -width / 2, y: -height / 2 + height * 0.3 },
          { x: -width / 2, y: height / 2 },
          { x: 0, y: height / 2 + height * 0.3 },
          { x: width / 2, y: height / 2 },
          { x: width / 2, y: -height / 2 + height * 0.3 },
        ], {
          friction: 0.8,
          frictionAir: 0.02,
          restitution: 0.5,
          density: 0.02,
          render: {
            sprite: {
              yOffset: height / 2
            }
          },
          isStatic: false
        })
      };
  
      const inertia = (width ** 2 + height ** 2) * heart.body.mass / 12;
      heart.body.inertia = inertia;
  
      return heart;
    }
  
    function createRectangle(x, y, width, height) {
      const rectangle = {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        color: getRandomColor(),
        body: Matter.Bodies.rectangle(x, y, width, height, {
          render: {
            fillStyle: getRandomColor(),
            strokeStyle: getRandomColor(),
            lineWidth: 2
          }
        })
      };
      return rectangle;
    }
  
    function createCircle(x, y, radius) {
      const circle = {
        x: x - radius,
        y: y - radius,
        radius,
        color: getRandomColor(),
        body: Matter.Bodies.circle(x, y, radius, {
          render: {
            fillStyle: getRandomColor(),
            strokeStyle: getRandomColor(),
            lineWidth: 2
          }
        })
      };
      return circle;
    }
  
    function createHalfCircle(x, y, radius) {
      const halfCircle = {
        x: x - radius,
        y: y - radius,
        radius,
        color: getRandomColor(),
        body: Matter.Bodies.fromVertices(x, y, [
          { x: -radius, y: 0 },
          { x: radius, y: 0 },
          { x: radius, y: -radius },
          { x: -radius, y: -radius }
        ], {
          render: {
            fillStyle: getRandomColor(),
            strokeStyle: getRandomColor(),
            lineWidth: 2
          }
        })
      };
      return halfCircle;
    }

    function getRandomValue(min, max) {
      return Math.random() * (max - min) + min;
    }
  
    function getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
  
    function getRandomColors(count) {
      const colors = [];
      for (let i = 0; i < count; i++) {
        colors.push(getRandomColor());
      }
      return colors;
    }
  
    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const body = shape.body;
  
        shape.x = body.position.x;
        shape.y = body.position.y;
  
        if (shape !== textObj) {
          drawHeart(shape);
        }
      }
  
      if (textObj) {
        drawText(textObj);
      }
  
      requestAnimationFrame(update);
    }
  
    function drawHeart(shape) {
      const { x, y, width, height, body, color } = shape;
      const angle = body.angle;
      const topCurveHeight = height * 0.3;
  
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
  
      ctx.beginPath();
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(
        0, 0,
        -width / 2, 0,
        -width / 2, topCurveHeight
      );
      ctx.bezierCurveTo(
        -width / 2, (height + topCurveHeight) / 2,
        0, (height + topCurveHeight) / 2,
        0, height
      );
      ctx.bezierCurveTo(
        0, (height + topCurveHeight) / 2,
        width / 2, (height + topCurveHeight) / 2,
        width / 2, topCurveHeight
      );
      ctx.bezierCurveTo(
        width / 2, 0,
        0, 0,
        0, topCurveHeight
      );
      ctx.closePath();
      ctx.fillStyle = shape.color;
      ctx.fill();
  
      ctx.restore();
    }
  
    function drawText(shape) {
      const { x, y, text, fontSize, colors } = shape;
      const totalWidth = ctx.measureText(text).width;
      const letterSpacing = 20;
    
      ctx.save();
      ctx.font = `bold ${fontSize}px Helvetica`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    
      const letters = text.split('');
      const letterWidth = fontSize * 0.6;
      const totalTextWidth = letters.length * letterWidth + (letters.length - 1) * letterSpacing;
      const startX = canvas.width / 2 - totalTextWidth / 2;
    
      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const color = colors[i % colors.length];
    
        ctx.fillStyle = color;
        ctx.fillText(letter, startX + i * (letterWidth + letterSpacing), y);
      }
    
      ctx.restore();
    }
    
  
    function resizeCanvas() {
      canvas.width = canvasContainer.offsetWidth;
      canvas.height = canvasContainer.offsetHeight;
    }
  
    Matter.Engine.run(engine);
    Matter.Render.run(render);
  });
  
