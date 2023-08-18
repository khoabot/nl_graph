d3.json("knowledge_graph_data.json").then(function (graph) {
    var svg = d3
        .select("body")
        .append("svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);

    var simulation = d3
        .forceSimulation(graph.nodes)
        .force(
            "link",
            d3.forceLink(graph.links).id((d) => d.id)
        )
        .force("charge", d3.forceManyBody())
        .force(
            "center",
            d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)
        );

    var link = svg
        .append("g")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .style("stroke", "#aaa") // Color of the links
        .style("stroke-width", "0.5px"); // Width of the links

    var node = svg
        .append("g")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", 5)
        .call(
            d3
                .drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );

    var zoom = d3
        .zoom()
        .scaleExtent([1 / 2, 4])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed() {
        var transform = d3.event.transform;
        node.attr("transform", transform);
        link.attr("transform", transform);
        labels.attr("transform", transform);
        
        // Adjust text size based on zoom scale
        var scale = transform.k;
        var fontSize = 10 / scale;  // Adjust base font size as needed
        fontSize = Math.min(14, Math.max(fontSize, 8));  // Set minimum and maximum font sizes
        labels.style("font-size", fontSize + "px");
    }
    
    window.toggleLabels = function () {
        labelsVisible = !labelsVisible;
        if (labelsVisible) {
            labels.style("display", "inline");
        } else {
            labels.style("display", "none");
        }
    };

    // Add labels for nodes
    var labels = svg
        .append("g")
        .selectAll("text")
        .data(graph.nodes)
        .enter()
        .append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text((d) => d.title.substring(0, 15) + "..."); // Displaying only the first 15 characters

    // Add dynamic tooltips
    node.on("mouseover", function (d) {
        var tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        tooltip.transition().duration(200).style("opacity", 0.9);

        tooltip
            .html(d.title + "<br/>" + "Add any other info here...")
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 28 + "px");
    }).on("mouseout", function (d) {
        d3.select(".tooltip").remove();
    });

    node.append("title").text((d) => d.title);

    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(graph.links);

    function ticked() {
        link.attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        labels // This is the addition for the labels
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y);
    }

    var labelsVisible = true;

    var linksVisible = true;

    window.toggleLinks = function() {
        linksVisible = !linksVisible;
        if (linksVisible) {
            link.style("display", "inline");
        } else {
            link.style("display", "none");
        }
    };
        
    function toggleLabels() {
        labelsVisible = !labelsVisible;
        if (labelsVisible) {
            labels.style("display", "inline");
        } else {
            labels.style("display", "none");
        }
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
});
