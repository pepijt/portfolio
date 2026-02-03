export function animateLabelHover(printers, currentView, isTransitioning, hoveredBlock) {
  if (currentView === null || isTransitioning) return;

  const currentPrinter = printers[currentView];
  if (!currentPrinter) return;

  const label = currentPrinter.getObjectByName('label');
  if (!label) return;

  const finalOffsetY = 4.6;
  label.children.forEach((block) => {
    if (block.userData.hoverOffset === undefined) block.userData.hoverOffset = 0;

    const targetOffset = (hoveredBlock === block) ? 0.15 : 0;
    block.userData.hoverOffset += (targetOffset - block.userData.hoverOffset) * 0.15;

    if (block.userData.originalY !== undefined) {
      block.position.y = block.userData.originalY + finalOffsetY + block.userData.hoverOffset;
    }
  });
}

export function animateNameHover(nameGroup, currentView, isTransitioning, hoveredBlock) {
  if (currentView !== null || isTransitioning || !nameGroup) return;

  nameGroup.children.forEach((block) => {
    if (block.userData.isNameBlock) {
      if (block.userData.hoverOffset === undefined) block.userData.hoverOffset = 0;

      const targetOffset = (hoveredBlock === block) ? 0.15 : 0;
      block.userData.hoverOffset += (targetOffset - block.userData.hoverOffset) * 0.15;

      if (block.userData.originalY !== undefined) {
        block.position.y = block.userData.originalY + block.userData.hoverOffset;
      }
    }
  });
}
