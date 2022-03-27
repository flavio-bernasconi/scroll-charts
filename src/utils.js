import { WIDTH, HEIGHT } from './constants';

export const getGroupCoordinates = categories => {
  const coordinatesByCategory = {};
  let counterY = 0;
  let loopCounter = 0;

  for (let index = 0; index < categories.length; index++) {
    const baseX = WIDTH / 4 / 1.1;
    const baseY = HEIGHT / 4 / 1.1;
    if (index % 4 === 0) counterY++;

    const xCoordinate = loopCounter % 4 === 0 ? 4 : loopCounter % 4;
    coordinatesByCategory[categories[index]] = {
      x: baseX * xCoordinate,
      y: baseY * counterY,
    };
    loopCounter++;
  }
  return coordinatesByCategory;
};
