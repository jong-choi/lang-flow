"use client";

/**
 * 엣지의 스타일을 지정하는 커스텀 엣지
 */
import { BaseEdge, type EdgeProps, getBezierPath } from "@xyflow/react";

export const CustomEdge: React.FC<EdgeProps> = (props) => {
  const { id, selected, style, markerEnd, markerStart } = props;

  const [edgePath] = getBezierPath(props);

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      markerStart={markerStart}
      style={{
        stroke: selected ? "#8b5cf6" : "#e2e8f0",
        strokeWidth: selected ? 3 : 2,
        fill: "none",
        ...style,
      }}
    />
  );
};

export const edgeTypes = {
  custom: CustomEdge,
};
