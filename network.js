function simulate(data,svg)

{
    const width = parseInt(svg.attr("viewBox").split(' ')[2])
    const height = parseInt(svg.attr("viewBox").split(' ')[3])
    const main_group = svg.append("g")
                    .attr("class", "canvas");
                    //.attr("transform", "translate(0, 50)")
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    //let color = d3.scaleOrdinal(d3.schemePaired);

        //calculate degree of the nodes:
        let node_degree={}; //initiate an object
        data.nodes.forEach((d, i)=>node_degree[i]=0)
        data.links.forEach(
         (d)=>{
            if(d.source in node_degree)
            {
                node_degree[d.source]++
            }
            else{
                node_degree[d.source]=0
            }
            if(d.target in node_degree)
            {
                node_degree[d.target]++
            }
            else{
                node_degree[d.target]=0
            }
          }
        )
    
        const degreeExtent = d3.extent(Object.values(node_degree), d=>d)
       
        const scale_radius = d3.scaleSqrt()
            .domain(degreeExtent)
            .range([5,30])

        const scale_link_stroke_width = d3.scaleLinear()
            .domain(d3.extent(data.links, d=> d.id))
            .range([1,5])

        const link_elements = main_group.append("g")
        .attr('transform',`translate(${width / 2},${height / 2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "black")
        //.style("stroke-width", d=> scale_link_stroke_width(d.value))
     
        
        const node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append("g")
        
        node_elements.append("circle")
        .attr("r", function(d) {return d.degree})
        .attr("fill", d=>color(d.cluster_label)) 
        .attr("class", function (d){return "gr_"+d.cluster_label})
            .on("mouseenter", function (m,d){
                d3.selectAll("circle").classed("inActive", true)
                d3.selectAll(".gr_"+d.cluster_label).classed("inActive", false)
               // d3.selectAll(".gr_" +d.cluster_label.classed("inActive", false))
        }) 
            .on("mouseleave", (m,d)=>{
                d3.selectAll("circle").classed("inActive", false)
        })

        node_elements.append("text")
        //.attr("class","label")
        .attr("text-anchor","middle")
        .text(d=>d.id)

        node_elements.on("mouseenter", (m,d)=>{
            console.log(d)
        })

    const ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide", d3.forceCollide().radius(35).iterations(1))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody().strength(-10))
        .force('link', d3.forceLink(data.links)
                         .id(function(n) {return n.id; }))
                  
        .on("tick", ticked);


    function ticked()
    {
        node_elements
            .attr('transform', d=> {return `translate(${d.x},${d.y})`})
        link_elements
            .attr("x1",d=>d.source.x)
            .attr("x2",d=>d.target.x)
            .attr("y1",d=>d.source.y)
            .attr("y2",d=>d.target.y)

        }


    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));
    function zoomed({transform}) {
        main_group.attr("transform", transform);
    }
}
