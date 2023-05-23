window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const shapes = [];
    let textObj = null;
  
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: canvas.width,
        height: canvas.height,
        wireframes: false
      }
    });
  
    // Add ground
    const ground = Matter.Bodies.rectangle(
      canvas.width / 2,
      canvas.height,
      canvas.width,
      10,
      { isStatic: true }
    );
    Matter.World.add(engine.world, ground);
  
    // Add walls
    const leftWall = Matter.Bodies.rectangle(
      0,
      canvas.height / 2,
      10,
      canvas.height,
      { isStatic: true }
    );
    const rightWall = Matter.Bodies.rectangle(
      canvas.width,
      canvas.height / 2,
      10,
      canvas.height,
      { isStatic: true }
    );
    const topWall = Matter.Bodies.rectangle(
      canvas.width / 2,
      0,
      canvas.width,
      10,
      { isStatic: true }
    );
    Matter.World.add(engine.world, [leftWall, rightWall, topWall]);
  
    canvas.addEventListener('mousedown', handleMouseDown);
  
    // Clear Canvas button
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    clearCanvasBtn.addEventListener('click', clearCanvas);
  
    function clearCanvas() {
  const hearts = shapes.filter(shape => shape !== textObj); // Filter out the hearts, excluding the text object
  shapes.length = 0; // Clear the shapes array
  shapes.push(textObj); // Add the text object back to the shapes array
  Matter.World.remove(engine.world, hearts.map(heart => heart.body)); // Remove heart bodies from Matter.js world
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
}

const changeColorBtn = document.getElementById('changeColorBtn');
changeColorBtn.addEventListener('click', changeColor);

function changeColor() {
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i] !== textObj) {
      shapes[i].color = getRandomColor(); // Assign a new random color to each heart shape
    }
  }
}

const changeTextColorBtn = document.getElementById('changeTextColorBtn');
  changeTextColorBtn.addEventListener('click', changeTextColor);

  function changeTextColor() {
    if (textObj) {
      textObj.colors = getRandomColors(textObj.text.length); // Assign new random colors to each letter of the text
    }
  }
  
    // Add Text button
    const addTextBtn = document.getElementById('addTextBtn');
    addTextBtn.addEventListener('click', addText);
  
    function addText() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value || 'itsaverykane'; // Use user input or 'itsaverykane' as placeholder
      
        const fontSize = 100;
        const colors = getRandomColors(text.length);
        const x = canvas.width / 2;
        const y = canvas.height / 2 + fontSize / 2;
      
        // Remove previous text body if it exists
        if (textObj) {
          Matter.World.remove(engine.world, textObj.body);
          shapes.splice(shapes.indexOf(textObj), 1);
        }
      
        textObj = {
          x: x - ctx.measureText(text).width / 2, // Center the text horizontally
          y: y,
          text: text,
          fontSize: fontSize,
          colors: colors,
          body: Matter.Bodies.rectangle(
            x,
            y,
            text.length * fontSize * 0.6,
            fontSize,
            {
              isSensor: false,
              isStatic: true
            }
          )
        };
      
        shapes.push(textObj);
        Matter.World.add(engine.world, textObj.body);
      
        textInput.value = ''; // Clear the input field
      
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
          x: x - width / 2, // Adjust x position
          y: y - height / 2, // Adjust y position
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
        const angle = body.angle; // Get the rotation angle of the body
        const topCurveHeight = height * 0.3;
      
        ctx.save(); // Save the current canvas state
        ctx.translate(x, y); // Translate to the center of the heart
        ctx.rotate(angle); // Rotate the canvas
      
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
        ctx.fillStyle = shape.color; // Use the color property from the shape object
        ctx.fill();
      
        ctx.restore(); // Restore the canvas state
      }
      
  
    function drawText(shape) {
        const { x, y, text, fontSize, colors } = shape;
        const totalWidth = ctx.measureText(text).width;
        const startX = canvas.width / 2 - totalWidth / 2;
        const letterSpacing = 20; // Adjust the character spacing (in pixels)

      
        ctx.save(); // Save the current canvas state
        ctx.font = `bold ${fontSize}px Helvetica`;
        ctx.textAlign = 'center'; // Set the text alignment to center
        ctx.textBaseline = 'middle';
      
        const letters = text.split(''); // Split the text into individual letters
      
        for (let i = 0; i < letters.length; i++) {
          const letter = letters[i];
          const color = colors[i % colors.length]; // Assign a color from the colors array based on the letter index
      
          ctx.fillStyle = color;
          ctx.fillText(letter, x + (i - letters.length / 2) * fontSize * 0.6, y); // Draw each letter with the assigned color
        }
      
        ctx.restore(); // Restore the canvas state
      }
      
      
      
      
      
      
       
    Matter.Engine.run(engine);
    Matter.Render.run(render);
  });
  