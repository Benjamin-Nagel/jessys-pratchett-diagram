import * as d3 from "d3";
import type { RunningCharacter } from "../../../types";
import { hideTooltip, showTooltip } from "../../../utils/common";
import { applyCharacterHighlight } from "./drawer";
import type { ActiveInformation, CurrentInformation } from "../original";

/**
 * Deactivates the active click highlight and restores default view.
 */
export function deactivateActiveHighlight(
  activeInformation: ActiveInformation,
  currentInformation: CurrentInformation
) {
  currentInformation.currentZoomedG
    ?.selectAll(`path.link`)
    .attr("opacity", 0.4);
  currentInformation.currentZoomedG
    ?.selectAll(`path.link-pattern`)
    .attr("opacity", 0.4);
  currentInformation.currentBookGroup?.style("opacity", 1);

  d3.selectAll(".legend-item-group").classed("highlighted-legend-item", false);
  d3.selectAll(".legend-item-group").classed("dimmed-legend-item", false);

  activeInformation.activeCharachterId = null;
  activeInformation.activeLegendType = null;
  hideTooltip(d3.select(".tooltip"));
}

/**
 * Function for character hover (mouseover) behavior.
 * @param event The D3 event object.
 * @param character The character being hovered.
 * @param tooltip The D3 tooltip.
 */
export function handleCharacterHoverOn(
  event: MouseEvent,
  character: RunningCharacter,
  tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
    activeInformation: ActiveInformation,
    currentInformation: CurrentInformation,
) {
  if (
    activeInformation.activeLegendType === null ||
    (activeInformation.activeLegendType === "character" && activeInformation.activeCharachterId === character.id)
  ) {
    applyCharacterHighlight(character, true, false, activeInformation, currentInformation);
    let tooltipContent = `<strong>${character.name}</strong>`;
    if (character.members && character.members.length > 0) {
      tooltipContent += `<br/>Members: ${character.members.join(", ")}`;
    }
    showTooltip(tooltip, tooltipContent, event);
  }
}

/**
 * Function for removing character hover (mouseout) behavior.
 * @param tooltip The D3 tooltip.
 */
export function handleCharacterHoverOff(
  activeInformation: ActiveInformation,
  currentInformation: CurrentInformation,
) {
  if (activeInformation.activeLegendType === null) {
    deactivateActiveHighlight(activeInformation, currentInformation);
  }
}
