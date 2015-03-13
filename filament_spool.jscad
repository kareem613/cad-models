// title: Filament Spool
// author: Kareem Sultan 
// license: Creative Commons CC BY
// tags: spool, filament, 3dprinting

function getParameterDefinitions() {
  return [
    { name: 'innerAssembly', caption: 'Assembly', type: 'choice', values: [0,1], captions: ["Outer", "Inner"], initial: 0 },
    { name: 'baseHeight', caption: 'Base Height', type: 'float', initial: 2.5 },
    { name: 'baseRadius', caption: 'Base Radius', type: 'int', initial: 65 },
    { name: 'baseCenterHoleRadius', caption: 'Base Center Hole Radius', type: 'int', initial: 18   },
    { name: 'spokeWidth', caption: 'Spoke Width', type: 'int', initial: 4 },
    { name: 'numSpokes', caption: 'Spoke Count', type: 'int', initial: 6 },
    { name: 'insideCollarRadiusOffset', caption: 'Inside Collar Radius Offset (from center hole)', type: 'int', initial: 10 },
    { name: 'collarWallHeight', caption: 'Collar Wall Height', type: 'int', initial: 30 },
    { name: 'collarWallThickness', caption: 'Collar Wall Thickness', type: 'int', initial: 2 },
    { name: 'collarSpacing', caption: 'Collar Spacing', type: 'float', initial: 1 },
    { name: 'gapRingSize', caption: 'Gap Ring Size', type: 'int', initial: 16 },
    { name: 'gapRingInnerOffset', caption: 'Gap Ring Inner Offset', type: 'int', initial: 10 }
  ];
}

function main(params) {
    
    insideCollarRadius = params.baseCenterHoleRadius + params.insideCollarRadiusOffset;
    outsideCollarRadius = insideCollarRadius + params.collarWallThickness + params.collarSpacing/2;
  
    collarRadius = params.innerAssembly == 1 ? insideCollarRadius : outsideCollarRadius;
      
    collarAssembly = collar(collarRadius, params);
    return assembly(params, collarAssembly, insideCollarRadius);
}

function assembly(params, collarAssembly, insideCollarRadius)
{
    var gapRingInnerRadius = insideCollarRadius + params.collarWallThickness + params.gapRingInnerOffset;
    var gapRingOuterRadius = gapRingInnerRadius + params.gapRingSize;
    var holeDistance = gapRingOuterRadius + (params.baseRadius - gapRingOuterRadius) / 2;
    
    var assemblyPart = basePlate(params)
        .subtract(gapRing(gapRingInnerRadius,gapRingOuterRadius))
        .union(allSpokes(params))
        .subtract(allPerimeterHoles(holeDistance, params))
        .subtract(baseCenterHole(params))
        .union(collarAssembly)
    ;
    return assemblyPart;
}

function basePlate(params){
    return CSG.cylinder({
        start: [0, 0, 0],
        end: [0, 0, params.baseHeight],
        radius: params.baseRadius
    });
}

function baseCenterHole(params){
    return CSG.cylinder({
        start: [0, 0, 0],
        end: [0, 0, params.baseHeight],
        radius: params.baseCenterHoleRadius
    });
}

function allSpokes(params){
    var spokes = [];
    
    for(var i = 0; i<params.numSpokes;i++){
        var angle = i*360/params.numSpokes;
        spoke = CSG.cube({radius:[params.baseRadius -2,params.spokeWidth/2,params.baseHeight/2], center:[0,0,params.baseHeight/2]}).rotateZ(angle);
        spokes.push(spoke);
        
    }
    return spokes;

}

function perimeterHole(distanceFromCenter, height, angle){
    return cylinder({r:2, h:height}).translate([distanceFromCenter,0,0]).rotateZ(angle);
}

function allPerimeterHoles(distanceFromCenter, params){
    
    var holes = [];
    var numHoles = params.numSpokes;
    for(var i = 0; i<numHoles;i++){
        var angle = (i*360/numHoles) + (360/numHoles/2);
        holes.push(perimeterHole(distanceFromCenter,params.baseHeight, angle));
    }
    return holes;
}

function collar(innerRadius, params){
    var holeCenterHeight = params.collarWallHeight/2 + params.baseHeight;
    return circle({r:innerRadius + params.collarWallThickness, center:true})
        .subtract(circle({r:innerRadius, center:true}))
        .extrude({offset: [0,0,params.collarWallHeight]}).translate([0,0,params.baseHeight])
        .subtract(cylinder({r:2.5, h:120}).rotateX(90).center([true, true,false]).translate([0,0,holeCenterHeight]))
        .subtract(cylinder({r:2.5, h:120}).rotateX(90).rotateZ(35).center([true, true,false]).translate([0,0,holeCenterHeight]));        
}



function gapRing(innerRadius, outerRadius){
    return circle({r:outerRadius, center:true})
        .subtract(circle({r:innerRadius, center:true}))
        .extrude({offset: [0,0,20]});
}
