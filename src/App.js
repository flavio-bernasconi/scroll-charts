import * as d3 from 'd3';
import { useEffect, useState } from 'react';

// function ForceGraph({ nodes }) {
//   const [animatedNodes, setAnimatedNodes] = useState([]);

//   // re-create animation every time nodes change
//   useEffect(() => {
//     const simulation = d3
//       .forceSimulation()
//       .force('x', d3.forceX(40))
//       .force('y', d3.forceY(30))
//       .force('charge', d3.forceManyBody().strength(1))
//       .force('collision', d3.forceCollide(5));

//     // update state on every frame
//     simulation.on('tick', () => {
//       setAnimatedNodes([...simulation.nodes()]);
//     });

//     // copy nodes into simulation
//     simulation.nodes([...nodes]);
//     // slow down with a small alpha
//     simulation.alpha(0.1).restart();

//     // stop simulation on unmount
//     return () => simulation.stop();
//   }, [nodes]);

//   return (
//     <g>
//       {animatedNodes.map(node => (
//         <circle cx={node.x} cy={node.y} r={node.r} key={node.id} stroke="black" fill="transparent" />
//       ))}
//     </g>
//   );
// }

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
const width = 800;
const height = 600;
let simulation;

export default function App() {
  const categoryColorScale = d3.scaleOrdinal(categories, colors);

  const nodes = d3.range(300).map(n => {
    return { id: n, r: radius, category: categories[getRandomNumberBetween(0, categories.length - 1)] };
  });

  const moveNodes = () => {
    simulation?.stop();
    const xScale = d3.scaleBand().domain(categories).range([0, width]);

    const groupedByCategories = nodes.reduce((acc, node, i) => {
      const oldValues = acc[node.category] || [];
      acc[node.category] = [...oldValues, node.id];
      return acc;
    }, {});
    const lengths = Object.values(groupedByCategories).map(a => a.length);
    const longestList = Math.max(...lengths);

    const yScale = d3.scaleLinear().domain([0, longestList]).range([height, 0]);

    d3.selectAll('circle')
      .data(nodes)
      .transition()
      .duration(600)
      .delay((d, i) => i * 2)
      .ease(d3.easeBackOut)
      .attr('cx', d => xScale(d.category))
      .attr('cy', d => {
        const indexPosition = groupedByCategories[d.category].findIndex(n => n === d.id);
        return yScale(indexPosition);
      });
  };

  const forceNodes = () => {
    simulation = d3
      .forceSimulation()
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceManyBody().strength(2))
      .force('collision', d3.forceCollide(2))
      .alphaDecay([0.02]);

    simulation.nodes(nodes);

    simulation.on('tick', () => {
      d3.selectAll('circle')
        .data(nodes)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });
  };

  useEffect(() => {
    forceNodes();
  }, []);

  return (
    <div className="App" style={{ height: '800vh' }}>
      <h1>React D3 force graph</h1>
      <button onClick={moveNodes}>movee</button>
      <button onClick={forceNodes}>puuush</button>
      <svg width={width} height={height} style={{ position: 'sticky', top: 60 }}>
        <g style={{ transform: 'translate(30px, -30px)' }}>
          {nodes.map(node => (
            <circle
              cx={getRandomNumberBetween(width / 2, width / 2 - 100)}
              cy={getRandomNumberBetween(height / 2, height / 2 - 100)}
              r={radius}
              key={node.id}
              stroke="none"
              fill={categoryColorScale(node.category)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
