import { DC98259800002 } from "@/icons";
import { useEffect, useState, useCallback, useRef } from "react";
import { MdZoomIn, MdZoomOut, MdCenterFocusStrong } from "react-icons/md";
import { TableColumn } from 'react-data-table-component';
import { CustomDataTable } from "@/components/ui/table";

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
    const [zoom, setZoom] = useState<number>(1);
    const [panX, setPanX] = useState<number>(0);
    const [panY, setPanY] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragOccurred, setIsDragOccurred] = useState<boolean>(false);
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Zoom functions
    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev * 1.2, 5)); // Max zoom 5x
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev / 1.2, 0.1)); // Min zoom 0.1x
    }, []);

    const handleFitToView = useCallback(() => {
        setZoom(1);
        setPanX(0);
        setPanY(0);
    }, []);

    // Mouse wheel zoom
    const handleWheel = useCallback((event: React.WheelEvent) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
    }, []);

    // Pan functions
    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        if (event.button === 0) { // Left mouse button
            event.preventDefault();
            setIsDragging(true);
            setIsDragOccurred(false);
            setDragStart({ x: event.clientX - panX, y: event.clientY - panY });
        }
    }, [panX, panY]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        // Reset drag detection after a short delay
        setTimeout(() => setIsDragOccurred(false), 100);
    }, []);

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
    const handlePartSelect = useCallback((partId: string, source: 'table' | 'svg' = 'svg') => {
        setSelected(current => current === partId ? null : partId);
        
        if (source === 'table') {
            // Scroll SVG to show the selected part
            // scrollToSvgPart(partId);
        } else {
            // Scroll to corresponding table row for CustomDataTable
            setTimeout(() => {
                if (partId) {
                    // Find the selected part index
                    const partIndex = parts.findIndex(part => part.id === partId);
                    if (partIndex !== -1) {
                        // Find the DataTable container
                        const dataTableContainer = document.querySelector('.rdt_TableBody') as HTMLElement;
                        if (dataTableContainer) {
                            // Find all table rows
                            const tableRows = dataTableContainer.querySelectorAll('.rdt_TableRow');
                            if (tableRows[partIndex]) {
                                const targetRow = tableRows[partIndex] as HTMLElement;
                                
                                // Scroll to the target row
                                targetRow.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                    inline: 'nearest'
                                });
                            }
                        }
                    }
                }
            }, 100); // Small delay to ensure DOM is updated
        }
    }, []);


    // Improved click handler with better event handling and larger click area
    const handleSvgClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
        // Don't handle click if dragging occurred
        if (isDragOccurred) {
            return;
        }
        
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
            handlePartSelect(partGroup.id, 'svg');
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

    // Global mouse events for panning
    useEffect(() => {
        const handleGlobalMouseMove = (event: MouseEvent) => {
            if (isDragging) {
                setIsDragOccurred(true);
                setPanX(event.clientX - dragStart.x);
                setPanY(event.clientY - dragStart.y);
            }
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            // Reset drag detection after a short delay
            setTimeout(() => setIsDragOccurred(false), 100);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, dragStart]);

    const columns: TableColumn<Part>[] = [
        {
            name: 'Part Number',
            selector: row => row.part_number,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Qty',
            selector: row => row.quantity,
            sortable: true,
            wrap: true,
        }
    ];
    return (
            <div className="bg-white shadow rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900"> Front Accessories Of Frame 车架前端附件</h3>
                            <p className="mt-1 text-sm text-gray-500">MS 700 - DC98259800002</p>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 px-6 py-4">
                    {/* <div className="md:col-span-1">
                        <PartCataloguePage />
                    </div> */}
                    {/* SVG Diagram */}
                    <div className="bg-white md:col-span-4 relative overflow-hidden" style={{ height: '700px' }}>
                        {/* Zoom Controls */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2 opacity-70 hover:opacity-100 transition duration-300">
                            <button
                                onClick={handleZoomIn}
                                className="p-2 hover:bg-gray-100 rounded transition-colors"
                                title="Zoom In"
                            >
                                <MdZoomIn size={20} />
                            </button>
                            <button
                                onClick={handleZoomOut}
                                className="p-2 hover:bg-gray-100 rounded transition-colors"
                                title="Zoom Out"
                            >
                                <MdZoomOut size={20} />
                            </button>
                            <button
                                onClick={handleFitToView}
                                className="p-2 hover:bg-gray-100 rounded transition-colors"
                                title="Fit to View"
                            >
                                <MdCenterFocusStrong size={20} />
                            </button>
                            <div className="text-xs text-center text-gray-500 px-1">
                                {Math.round(zoom * 100)}%
                            </div>
                        </div>
                        
                        {/* SVG Container */}
                        <div
                            ref={svgContainerRef}
                            className={`w-full h-full flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            style={{ 
                                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                                transformOrigin: 'center center'
                            }}
                            onWheel={handleWheel}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <DC98259800002
                                ref={svgRef}
                                className="w-full h-auto"
                                onClick={handleSvgClick}
                                style={{ userSelect: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Parts List */}
                    <div className="bg-white p-4 md:col-span-2">
                        <div ref={tableContainerRef} className="max-h-[600px] overflow-y-auto">
                            <CustomDataTable
                                columns={columns}
                                data={parts}
                                loading={false}
                                pagination={false}
                                paginationServer
                                paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                                responsive
                                highlightOnHover
                                striped={false}
                                persistTableHead
                                borderRadius="8px"
                                fixedHeader={true}
                                className="w-full"
                                onRowClicked={(row: Part) => handlePartSelect(row.id, 'table')}
                                fixedHeaderScrollHeight="600px"
                                conditionalRowStyles={[
                                    {
                                        when: (row: Part) => row.id === selected,
                                        style: {
                                            backgroundColor: 'rgba(255, 235, 59, 0.3)',
                                            borderLeft: '4px solid #FFC107',
                                        },
                                    },
                                ]}
                            />
                            {/* <table className="w-full table-fixed">
                                <thead className="sticky top-0 bg-white">
                                    <tr className="bg-[#dfe8f2]">
                                        <th className="border p-3 text-left text-sm font-medium text-gray-700 rounded-l-xs">Part Number</th>
                                        <th className="border p-3 text-left text-sm font-medium text-gray-700">Name</th>
                                        <th className="border p-3 text-left text-sm font-medium text-gray-700 rounded-r-xs">Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parts.map((part) => (
                                        <tr
                                            key={part.id}
                                            data-part-id={part.id}
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
                            </table> */}
                        </div>
                        
                        {/* Selected Part Info */}
                        {/* {selected && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h4 className="font-medium text-yellow-800">Selected Part:</h4>
                                <p className="text-sm text-yellow-700">
                                    {parts.find(p => p.id === selected)?.name} ({selected})
                                </p>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>
    );
}
