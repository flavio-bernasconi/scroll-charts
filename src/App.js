import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import { getGroupCoordinates } from './utils';
import { WIDTH, HEIGHT } from './constants';

const getRandomNumberBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const categories = [
  'Engineering',
  'Business',
  'Physical Sciences',
  'Law & Public Policy',
  'Computers & Mathematics',
  'Agriculture & Natural Resources',
  'Industrial Arts & Consumer Services',
  'Arts',
  'Health',
  'Social Science',
  'Biology & Life Science',
  'Education',
  'Humanities & Liberal Arts',
  'Psychology & Social Work',
  'Communications & Journalism',
  'Interdisciplinary',
];

const colors = [
  '#ffcc00',
  '#ff6666',
  '#cc0066',
  '#66cccc',
  '#f688bb',
  '#65587f',
  '#baf1a1',
  '#333333',
  '#75b79e',
  '#66cccc',
  '#9de3d0',
  '#f1935c',
  '#0c7b93',
  '#eab0d9',
  '#baf1a1',
  '#9399ff',
];

const radius = 3;
let simulation;
const numNodes = 60;
const nodes = d3.range(numNodes).map(n => {
  return {
    id: Math.floor(Math.random() * Date.now()),
    r: radius,
    category: categories[getRandomNumberBetween(0, categories.length - 1)],
    price: getRandomNumberBetween(10, 300),
  };
});

export default function App() {
  const [activeStep, setActiveStep] = useState(0);

  const coordinatesByCategory = getGroupCoordinates(categories);

  const groupedByCategories = nodes.reduce((acc, node, i) => {
    const oldValues = acc[node.category] || [];
    acc[node.category] = [...oldValues, node.id];
    return acc;
  }, {});

  const lengths = Object.values(groupedByCategories).map(a => a.length);
  const longestList = Math.max(...lengths);

  const categoryColorScale = d3.scaleOrdinal(categories, colors);
  const radiusScale = d3.scaleLinear().domain([1, 300]).range([4, 12]);
  const priceScale = d3.scaleLinear().domain([1, 300]).range([0, WIDTH]);
  const yScale = d3.scaleLinear().domain([0, longestList]).range([HEIGHT, 0]);
  const categoryScale = d3.scaleBand().domain(categories).range([0, WIDTH]);

  const moveNodes = () => {
    d3.selectAll('circle')
      .data(nodes)
      .transition('sort-circles')
      .duration(600)
      .delay((d, i) => i * 2)
      .ease(d3.easeBackOut)
      .attr('cx', d => categoryScale(d.category))
      .attr('cy', d => {
        const indexPosition = groupedByCategories[d.category].findIndex(n => n === d.id);
        return HEIGHT - indexPosition * 11;
      })
      .transition()
      .duration(300)
      .delay(1000)
      .attr('r', 5);
    // .attr('r', d => radiusScale(d.price));
  };

  const moveNodesPrice = () => {
    d3.selectAll('circle')
      .data(nodes)
      .transition('move-circles')
      .duration(600)
      .delay((d, i) => i * 2)
      .ease(d3.easeBackOut)
      .attr('cx', d => priceScale(d.price))
      .transition('change-radius')
      .duration(500)
      .delay(300)
      .attr('r', 4);
  };

  const forceNodes = () => {
    d3.selectAll('circle')
      .data(nodes)
      .transition('make-circles-gray')
      .duration(600)
      .delay(200)
      .attr('r', 4)
      .attr('fill', 'gray');

    simulation = d3
      .forceSimulation(nodes)
      .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force('charge', d3.forceManyBody(4).strength(numNodes * 1.2))
      .force(
        'collide',
        d3.forceCollide(d => radiusScale(d.price)),
      )
      .alpha(0.7)
      .alphaDecay(0.02)
      .restart();

    simulation.on('tick', () => {
      d3.selectAll('circle')
        .data(nodes)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });
  };

  const forceGroup = () => {
    d3.selectAll('circle')
      .data(nodes)
      .transition('make-circles-gray')
      .duration(300)
      .delay(200)
      .attr('fill', d => categoryColorScale(d.category))
      .transition('make-circles-gray')
      .duration(300)
      .delay(200)
      .attr('r', d => radiusScale(d.price));

    simulation = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force(
        'x',
        d3.forceX().x(d => coordinatesByCategory[d.category].x),
      )
      .force(
        'y',
        d3.forceY().y(d => coordinatesByCategory[d.category].y),
      )
      .force(
        'collide',
        d3.forceCollide(d => radiusScale(d.price) + 1),
      );

    simulation.on('tick', () => {
      d3.selectAll('circle')
        .data(nodes)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });
  };

  const functionsList = [forceNodes, forceGroup, moveNodes, moveNodesPrice];

  useEffect(() => {
    functionsList[activeStep] && functionsList[activeStep]();
  }, [activeStep]);

  return (
    <div className="App" style={{ height: `${functionsList.length * 60}vh` }}>
      {[0, 0, 0, 0].map((_, i) => (
        <VisibilitySensor
          onChange={isVisible => {
            if (isVisible) {
              setActiveStep(i);
              simulation?.stop();
            }
          }}
        >
          <section
            style={{
              width: '30%',
              position: 'absolute',
              height: '60vh',
              top: `${i * 60}vh`,
              border: 'solid 1px black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <h1>{i} section</h1>
          </section>
        </VisibilitySensor>
      ))}

      <svg width={WIDTH} height={HEIGHT} style={{ position: 'sticky', top: 60, marginLeft: '40%' }}>
        <g style={{ transform: 'translate(30px, -30px)' }}>
          {nodes.map(node => (
            <circle key={node.id} stroke="none" fill="gray" />
          ))}
        </g>
      </svg>
    </div>
  );
}
