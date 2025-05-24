document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('keplerSvg');
    const svgNS = "http://www.w3.org/2000/svg";

    const startNSlider = document.getElementById('startNSlider');
    const startNValueDisplay = document.getElementById('startNValue');
    const iterationsSlider = document.getElementById('iterationsSlider');
    const iterationsValueDisplay = document.getElementById('iterationsValue');
    const calculatedConstantDisplay = document.getElementById('calculatedConstant');
    const kbInfoDisplay = document.getElementById('kbInfo');
    const funnyCommentDisplay = document.getElementById('funnyComment');

    const svgSize = 400;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    let initialDisplayRadius = svgSize * 0.45; // This is the circumradius of the first polygon

    const KEPLER_BOUWKAMP_CONSTANT_APPROX = 0.1149420448;

    const funnyComments = [
        "Look at those regular polygons hug those circles!",
        "It's like a geometric Matryoshka doll, all perfectly regular!",
        "Shrinking faster than my patience on a Monday morning!",
        "Are we there yet? Approaching the limit with perfectly regular shapes...",
        "To infinity... and beyond! (Well, almost, with regular N-gons)",
        "So many sides, so little space! All neatly regular.",
        "Warning: May cause an urge to tile your bathroom with regular polygons.",
        "This is how cosmic dust bunnies are made... with precision geometry.",
        "Is it a portal to another dimension? Or just beautiful regular math?",
        "The polygons are getting shy and smaller, but always regular!",
        "It's a regular geometry party in here!",
        "Wow, that escalated... or de-escalated quickly and regularly?"
    ];

    function getRandomComment(currentRadius) {
        if (currentRadius < 5 && iterationsSlider.value > 10) {
            return "It's so tiny! I need my geometric microscope for these regular forms!";
        }
        if (parseInt(startNSlider.value) + parseInt(iterationsSlider.value) > 15 && parseInt(iterationsSlider.value) > 10) {
            return "That's a lot of sides! We're practically making a circle out of very regular straight lines!";
        }
        return funnyComments[Math.floor(Math.random() * funnyComments.length)];
    }

    function createSVGElement(tag, attributes) {
        const element = document.createElementNS(svgNS, tag);
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        element.classList.add('shape');
        element.style.opacity = '0';
        element.style.transform = 'scale(0.5)';
        return element;
    }

    // Draws a regular polygon.
    // cx, cy: center coordinates
    // radius: circumradius of the polygon (distance from center to any vertex)
    // sides: number of sides (must be >= 3)
    // rotation: initial angle offset for the first vertex (in radians)
    // color: fill color
    function drawPolygon(cx, cy, radius, sides, rotation = 0, color = 'rgba(52, 152, 219, 0.7)') {
        if (sides < 3) return; // Not a polygon

        let points = "";
        for (let i = 0; i < sides; i++) {
            // Calculate vertex position:
            // (i * 2 * Math.PI / sides) ensures equal angular separation between vertices.
            // All points are at 'radius' distance from 'cx, cy'.
            // These two conditions define a regular polygon.
            const angle = rotation + (i * 2 * Math.PI / sides);
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            points += `${x},${y} `;
        }
        const polygon = createSVGElement('polygon', {
            points: points.trim(),
            fill: color,
            stroke: '#2c3e50',
            'stroke-width': Math.max(0.5, 2 * (radius / initialDisplayRadius))
        });
        svg.appendChild(polygon);
        setTimeout(() => {
            polygon.style.opacity = '1';
            polygon.style.transform = 'scale(1)';
        }, 50);
    }

    function drawCircle(cx, cy, r, color = 'rgba(231, 76, 60, 0.6)') {
        const circle = createSVGElement('circle', {
            cx: cx,
            cy: cy,
            r: r,
            fill: color,
            stroke: '#c0392b',
            'stroke-width': Math.max(0.5, 1.5 * (r / initialDisplayRadius))
        });
        svg.appendChild(circle);
        setTimeout(() => {
            circle.style.opacity = '1';
            circle.style.transform = 'scale(1)';
        }, 50);
    }

    function calculateAndDraw() {
        svg.innerHTML = '';

        const startK = parseInt(startNSlider.value); // k: number of sides for the starting polygon
        const numIterations = parseInt(iterationsSlider.value);

        startNValueDisplay.textContent = startK;
        iterationsValueDisplay.textContent = numIterations;

        if (startK === 3) {
            kbInfoDisplay.style.display = 'block';
        } else {
            kbInfoDisplay.style.display = 'none';
        }

        let currentCircumradiusForPolygon = initialDisplayRadius;
        let calculatedProduct = 1.0; // This will be the product of cos(pi/n) terms

        const polygonColors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];
        const circleColors = ['rgba(52, 152, 219, 0.3)', 'rgba(231, 76, 60, 0.3)', 'rgba(46, 204, 113, 0.3)', 'rgba(241, 196, 15, 0.3)', 'rgba(155, 89, 182, 0.3)', 'rgba(26, 188, 156, 0.3)'];

        // The first conceptual circle (C0) has radius `initialDisplayRadius`.
        // The Kepler-Bouwkamp constant is R_final / R_0. We effectively treat R_0 = 1 for the product calculation,
        // and scale `initialDisplayRadius` visually.

        for (let i = 0; i < numIterations; i++) {
            if (currentCircumradiusForPolygon < 0.5 && i > 5) {
                funnyCommentDisplay.textContent = "It's become too small to see! The power of infinity!";
                break;
            }
            const currentNumSides = startK + i; // Number of sides for the current regular polygon
            const polygonRotation = (Math.PI / currentNumSides) + (Math.PI / 2); // Orient polygon (e.g., flat top)

            // 1. Draw the current regular polygon. It's inscribed in a conceptual circle of radius `currentCircumradiusForPolygon`.
            drawPolygon(centerX, centerY, currentCircumradiusForPolygon, currentNumSides, polygonRotation, polygonColors[i % polygonColors.length]);

            // 2. Calculate the factor cos(π / currentNumSides). This is ratio of inradius_polygon / circumradius_polygon.
            const cosFactor = Math.cos(Math.PI / currentNumSides);
            if (i === 0 && startK === 3) { // For K-B, the first term is cos(pi/3)
                 calculatedProduct = cosFactor;
            } else if (startK > 3 && i === 0) {
                 calculatedProduct = cosFactor;
            }
            else if (i > 0) {
                 calculatedProduct *= cosFactor;
            }


            // 3. The radius of the circle inscribed *in this polygon* is currentCircumradiusForPolygon * cosFactor.
            // This inscribed circle becomes the circumcircle for the *next* polygon.
            const newInscribedCircleRadius = currentCircumradiusForPolygon * cosFactor;

            // 4. Draw this newly inscribed circle.
            if (newInscribedCircleRadius > 0.1) {
                 drawCircle(centerX, centerY, newInscribedCircleRadius, circleColors[i % circleColors.length]);
            }

            // 5. Update currentCircumradiusForPolygon for the next iteration.
            currentCircumradiusForPolygon = newInscribedCircleRadius;
        }

        if (numIterations === 0) {
            calculatedConstantDisplay.textContent = "N/A (select iterations)";
            funnyCommentDisplay.textContent = "Let's start building those shapes!";
        } else {
            calculatedConstantDisplay.textContent = calculatedProduct.toFixed(10);
            funnyCommentDisplay.textContent = getRandomComment(currentCircumradiusForPolygon);
        }
    }

    startNSlider.addEventListener('input', () => {
        startNValueDisplay.textContent = startNSlider.value;
    });
    startNSlider.addEventListener('change', calculateAndDraw);

    iterationsSlider.addEventListener('input', () => {
        iterationsValueDisplay.textContent = iterationsSlider.value;
        calculateAndDraw();
    });

    // Initial draw
    calculateAndDraw();
});
