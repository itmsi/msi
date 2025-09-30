import { DC98259800002 } from "@/icons";
import { useEffect, useState, useCallback } from "react";

interface Part {
    id: string;
    quantity: number;
    part_number: string;
    name: string;
}

const parts: Part[] = [
    { id: "part-1", part_number: 'DZ98189800710', quantity: 1, name: "1st Cross Beam Assembly" },
    { id: "part-2", part_number: 'DZ98149800008', quantity: 1, name: "Right Protracting Beam" },
    { id: "part-3", part_number: 'DZ98149800007', quantity: 1, name: "Left Protracting Beam" },
    { id: "part-4", part_number: 'DZ98319800003', quantity: 2, name: "Strengthening Pad" },
    { id: "part-5", part_number: 'Q40314', quantity: 8, name: "Spring Washer 190003931162" },
    { id: "part-6", part_number: 'Q401B14', quantity: 8, name: "Flat Washer" },
    { id: "part-7", part_number: 'Q1811475TF3', quantity: 3, name: "Toothed Bolt With Hexagon Flange Face" },
    { id: "part-8", part_number: 'Q1811445TF3', quantity: 8, name: "Toothed Bolt With Hexagon Flange Face" },
    { id: "part-9", part_number: '06.11251.2005', quantity: 11, name: "Hexagon Nut With Flange/M7.112.40 M14*1.5-10-MAN183B1" },
    { id: "part-10", part_number: 'Q18114100TF3', quantity: 4, name: "Toothed Bolt With Hexagon Flange Face" }
];

export default function ExplodedView() {
    const [selected, setSelected] = useState<string | null>(null);

    // Clean up existing highlights
    const clearHighlights = useCallback(() => {
        const existingHighlights = document.querySelectorAll("circle.highlight-circle");
        existingHighlights.forEach(circle => circle.remove());
    }, []);

    // Add highlight to selected part
    const addHighlight = useCallback((partId: string) => {
        const group = document.querySelector<SVGGElement>(`g#${partId}`);
        if (!group) return;

        try {
            const bbox = group.getBBox();
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height / 2;
            const r = Math.max(bbox.width, bbox.height) / 0.9;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("class", "highlight-circle");
            circle.setAttribute("cx", String(cx));
            circle.setAttribute("cy", String(cy));
            circle.setAttribute("r", String(r));
            circle.setAttribute("fill", "rgba(255, 200, 0, 0.4)");
            circle.setAttribute("stroke", "rgba(255, 200, 0, 0.8)");
            circle.setAttribute("stroke-width", "2");
            circle.style.pointerEvents = "none"; // Prevent interference with clicks

            // Insert at the beginning so it appears behind other elements
            group.insertBefore(circle, group.firstChild);
        } catch (error) {
            console.error("Error creating highlight:", error);
        }
    }, []);

    // Handle part selection
    const handlePartSelect = useCallback((partId: string) => {
        setSelected(current => current === partId ? null : partId);
    }, []);

    // Improved click handler with better event handling and larger click area
    const handleSvgClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
        event.preventDefault();
        event.stopPropagation();
        
        let target = event.target as Element;
        let partGroup: SVGGElement | null = null;

        // Traverse up the DOM tree to find the part group
        while (target && target !== event.currentTarget) {
            if (target.tagName === 'g' && target.id && target.id.startsWith('part-')) {
                partGroup = target as SVGGElement;
                break;
            }
            // Also check if the target is inside a group with part- id
            if (target.tagName !== 'svg') {
                const parentGroup = target.closest("g[id^='part-']");
                if (parentGroup) {
                    partGroup = parentGroup as SVGGElement;
                    break;
                }
            }
            target = target.parentElement as Element;
        }

        if (partGroup && partGroup.id) {
            handlePartSelect(partGroup.id);
        }
    }, [handlePartSelect]);

    // Enhanced hover effects and clickable areas
    useEffect(() => {
        const groups = document.querySelectorAll<SVGGElement>("g[id^='part-']");
        
        const handleMouseEnter = (event: Event) => {
            const group = event.currentTarget as SVGGElement;
            group.style.cursor = 'pointer';
            group.style.opacity = '0.8';
            group.style.filter = 'brightness(1.1)';
            
            // Show clickable area on hover
            const clickArea = group.querySelector('rect.click-area');
            if (clickArea) {
                clickArea.setAttribute("stroke", "rgba(59, 130, 246, 0.5)");
                clickArea.setAttribute("stroke-width", "2");
                clickArea.setAttribute("stroke-dasharray", "5,5");
                clickArea.setAttribute("fill", "rgba(59, 130, 246, 0.1)");
            }
        };

        const handleMouseLeave = (event: Event) => {
            const group = event.currentTarget as SVGGElement;
            group.style.opacity = '1';
            group.style.filter = 'none';
            
            // Hide clickable area visual
            const clickArea = group.querySelector('rect.click-area');
            if (clickArea) {
                clickArea.setAttribute("stroke", "none");
                clickArea.setAttribute("fill", "transparent");
            }
        };

        groups.forEach((group) => {
            // Make sure all child elements are clickable
            group.style.pointerEvents = 'all';
            const childElements = group.querySelectorAll('*');
            childElements.forEach(child => {
                (child as SVGElement).style.pointerEvents = 'all';
            });

            // Create invisible clickable area for better UX
            try {
                // Remove existing clickable area if exists
                const existingClickArea = group.querySelector('rect.click-area');
                if (existingClickArea) {
                    existingClickArea.remove();
                }

                const bbox = group.getBBox();
                const padding = 15; // Extra clickable area padding
                
                const clickArea = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                clickArea.setAttribute("class", "click-area");
                clickArea.setAttribute("x", String(bbox.x - padding));
                clickArea.setAttribute("y", String(bbox.y - padding));
                clickArea.setAttribute("width", String(bbox.width + padding * 2));
                clickArea.setAttribute("height", String(bbox.height + padding * 2));
                clickArea.setAttribute("fill", "transparent");
                clickArea.setAttribute("stroke", "none");
                clickArea.style.pointerEvents = "all";
                clickArea.style.cursor = "pointer";

                // Insert at the end so it's on top for clicking
                group.appendChild(clickArea);
            } catch (error) {
                // If getBBox fails, just continue without the clickable area
                console.warn("Could not create clickable area for", group.id);
            }

            group.addEventListener('mouseenter', handleMouseEnter);
            group.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            groups.forEach((group) => {
                // Clean up clickable areas
                const clickArea = group.querySelector('rect.click-area');
                if (clickArea) {
                    clickArea.remove();
                }
                
                group.removeEventListener('mouseenter', handleMouseEnter);
                group.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []);

    // Handle highlighting when selection changes
    useEffect(() => {
        clearHighlights();
        if (selected) {
            addHighlight(selected);
        }
    }, [selected, clearHighlights, addHighlight]);

    return (
        <div className="flex gap-6 p-6">
            {/* SVG Diagram */}
            <div className="border rounded-lg shadow-md bg-white">
                <DC98259800002
                    className="w-[800px] h-auto cursor-pointer"
                    onClick={handleSvgClick}
                    style={{ userSelect: 'none' }}
                />
            </div>

            {/* Parts List */}
            <div className="border rounded-2xl shadow-md bg-white p-4 min-w-[400px]">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Parts List</h3>
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-white">
                            <tr className="bg-gray-100">
                                <th className="border p-3 text-left text-sm font-medium text-gray-700">Part Number</th>
                                <th className="border p-3 text-left text-sm font-medium text-gray-700">Name</th>
                                <th className="border p-3 text-left text-sm font-medium text-gray-700">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.map((part) => (
                                <tr
                                    key={part.id}
                                    className={`cursor-pointer transition-colors duration-200 ${
                                        selected === part.id 
                                            ? "bg-yellow-100 border-yellow-300" 
                                            : "hover:bg-gray-50"
                                    }`}
                                    onClick={() => handlePartSelect(part.id)}
                                >
                                    <td className="border p-3 text-sm font-mono">{part.part_number}</td>
                                    <td className="border p-3 text-sm">{part.name}</td>
                                    <td className="border p-3 text-sm text-center">{part.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Selected Part Info */}
                {selected && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800">Selected Part:</h4>
                        <p className="text-sm text-yellow-700">
                            {parts.find(p => p.id === selected)?.name} ({selected})
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
