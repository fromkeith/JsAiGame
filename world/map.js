define(["geom/geom", "geom/polygon", "geom/quadTree"], function (geom, Polygon, QuadTree) {
	"use strict";
	return function (mapDetails) {
		function randomColor() {
			return (("#" + Math.round(Math.random() * 59 + 40)) + Math.round(Math.random() * 59 + 40)) + Math.round(Math.random() * 59 + 40);
		}
		/**
		 * Creates the navigation mesh.
		 * @return a quadtree containing the nav mesh polygons
		 */
		function createNavMesh(x, y, width, height, navPolygons) {
			var quadTree = new QuadTree(x, y, width, height), polys = [], i, p, poly, edge, pointMerger, mesh = [];
			// simplify the points so there is only 1 set of points
			// first put them in a list so we can sort them
			pointMerger = geom.pointSimplifier();
			for (i = 0; i < navPolygons.length; i++) {
				mesh.push([]);
				for (p = 0; p < navPolygons[i].points.length; p++) {
					mesh[i].push(pointMerger.addPoint({
						x : navPolygons[i].points[p].x,
						y : navPolygons[i].points[p].y
					}));
				}
				poly = new Polygon(mesh[i]);
				for (p = 0; p < mesh[i].length; p++) {
					mesh[i][p].parents.push(poly);
					edge = pointMerger.addEdge(mesh[i][p], mesh[i][(p + 1) % mesh[i].length]);
					edge.parents.push(poly);
					poly.edges.push(edge);
				}

				polys.push(poly);
				quadTree.insert(poly);
			}
			return quadTree;
		}
		function subdivide(groundPoly, edges) {
			var i, e, k, ge, considerEdges = [], breakEdge, inter, frontGround = [],
				backGround = [], groundSwitch, interPoint, outputSet = [], doAdd, badLine;
			for (i = 0; i < edges.length; i++) {
				e = edges[i];
				doAdd = false;
				badLine = false;
				for (k = 0; k < groundPoly.edges.length; k++) {
					ge = groundPoly.edges[k];
					if (e.seg.line.intersects(ge.seg)) {
						doAdd = true;
					}
					if (e.seg.line.eql(ge.seg.line)) {
						badLine = true;
					}
				}
				if (doAdd && !badLine) {
					considerEdges.push(e);
				}
			}
			if (considerEdges.length > 0) {
				breakEdge = considerEdges.pop();
				for (i = 0; i < groundPoly.edges.length; i++) {
					ge = groundPoly.edges[i];
					inter = ge.seg.intersectionWith(breakEdge.seg.line);
					if (inter) {
						interPoint = {x: inter.elements[0], y: inter.elements[1]};
					}
					if (inter &&  groundPoly.contains(interPoint)) {
						frontGround.push(ge.points[0]);
						frontGround.push(interPoint);
						backGround.push(interPoint);

						groundSwitch = frontGround;
						frontGround = backGround;
						backGround = groundSwitch;
					} else {
						frontGround.push(ge.points[0]);
					}
				}
				outputSet = outputSet.concat(subdivide(new Polygon(frontGround, true), considerEdges));
				outputSet = outputSet.concat(subdivide(new Polygon(backGround, true), considerEdges));
			} else {
				outputSet.push(groundPoly);
			}
			return outputSet;
		}
		function makeNavTree(x, y, width, height, polys) {
			var i, k, j, canRemove, edgeSet = [], baseGroundPoly, result, culledResult = [];
			for (i = 0; i < polys.length; i++) {
				edgeSet = edgeSet.concat(polys[i].edges);
			}
			baseGroundPoly = new Polygon([
				{x: x, y: y}, {x: width, y: y}, {x: width, y: height}, {x: x, y: height}
			], true);
			result = subdivide(baseGroundPoly, edgeSet);
			for (i = 0; i < result.length; i++) {
				for (k = 0; true; k++) {
					if (k === polys.length) {
						culledResult.push(result[i]);
						break;
					}
					canRemove = true;
					for (j = 0; j < result[i].points.length; j++) {
						if (!polys[k].contains(result[i].points[j])) {
							canRemove = false;
							break;
						}
					}
					if (canRemove) {
						break;
					}
				}
			}
			return culledResult;
		}
		/**@
		 * mapDetails:
		 * {w:#, h:#, border:"", walls:#}
		 */
		function createMap(mapDetails) {
			var mesh = [], i, wall, quadTree, navTree, poly, p, edge, pointMerger, allPolys = [], tmpNavPolys;
			for (i = 0; i < mapDetails.walls.length; i++) {
				wall = mapDetails.walls[i];
				Crafty.e("2D, Canvas, wall, " + wall.sp)
					.attr({w: wall.w, h: wall.h, x: wall.x, y: wall.y});
				mesh.push([
					{x: wall.x, y: wall.y},
					{x: wall.x + wall.w, y: wall.y},
					{x: wall.x + wall.w, y: wall.y + wall.h},
					{x: wall.x, y: wall.y + wall.h}
				]);
			}
			// close the environment:
			Crafty.e("2D, Canvas, wall, " + mapDetails.border)
				.attr({w: mapDetails.w, h: 16, x: 10, y: 0});
			Crafty.e("2D, Canvas, wall, " + mapDetails.border)
				.attr({w: mapDetails.w, h: 16, x: 0, y: mapDetails.h});
			Crafty.e("2D, Canvas, wall, " + mapDetails.border)
				.attr({w: 16, h: mapDetails.h, x: 0, y: 0});
			Crafty.e("2D, Canvas, wall, " + mapDetails.border)
				.attr({w: 16, h : mapDetails.h, x : mapDetails.w, y : 10});
			quadTree =  new QuadTree(0, 0, 1024, 1024);
			pointMerger = geom.pointSimplifier();
			for (i = 0; i < mesh.length; i++) {
				for (p = 0; p < mesh[i].length; p++) {
					mesh[i][p] = pointMerger.addPoint({
						x : mesh[i][p].x,
						y : mesh[i][p].y
					});
				}
				poly = new Polygon(mesh[i]);
				for (p = 0; p < mesh[i].length; p++) {
					mesh[i][p].parents.push(poly);
					edge = pointMerger.addEdge(mesh[i][p], mesh[i][(p + 1) % mesh[i].length]);
					edge.parents.push(poly);
					poly.edges.push(edge);
				}
				allPolys.push(poly);
				quadTree.insert(poly);
			}
			tmpNavPolys = makeNavTree(20, 20, mapDetails.w - 20, mapDetails.h - 20, allPolys);
			for (i = 0; i < tmpNavPolys.length; i++) {
				Crafty.e("PolyDrawer").poly(tmpNavPolys[i].points, randomColor())._fill = true;
			}
			navTree = createNavMesh(0, 0, mapDetails.w, mapDetails.h, tmpNavPolys);
			return {objects : quadTree, nav: navTree};
		}

		return createMap(mapDetails);
	};
});