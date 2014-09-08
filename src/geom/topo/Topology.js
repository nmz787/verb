verb.topo = {};

(function(topo, core){

	topo.Topology = function(nodeTypeName) {

		core.WatchObject.call(this);

		topo.id = core.uid();
		
		this.uniqueId = function() {
			return id;
		};

		this.nodeTypeName = function(){
			return nodeTypeName;
		};

	}.inherits( core.WatchObject );

	topo.Solid = function( startFace, startEdge, startVertex ) {

		Topology.call(this, "Solid");

		this.startFace = startFace;
		this.startEdge = startEdge;
		this.startVertex = startVertex;

	}.inherits( Topology );

	topo.Solid.prototype.addFace = function(){

		var newFace;
		var where = this.startFace;

		// if there are no faces yet, init
		if ( !where ) {
			newFace = new topo.Face( this );
			this.startFace = newFace;
			where = newFace;
		} 

		if ( where.prev ){
			where.prev.next = newFace;
		}

		where.prev = newFace;
		newFace.next = where;

		return newFace;

	};

	topo.Solid.prototype.addFace = function(face){

		var where = this.startFace;

		// if there are no faces yet, init
		if ( !where ) {
			this.startFace = face;
			where = face;
		} 

		if ( where.prev ){
			where.prev.next = face;
		}

		where.prev = face;
		face.next = where;

		return face;

	};


	function enumerate( start, continueFunc, nextFunc, transf ){
		var coll = [];
		var it = start;

		while ( continueFunc( it ) ){
			coll.push( transf ? transf( it ) : it );
			it = nextFunc( it );
		}

		return coll;
	};

	function notNull(x){
		return x;
	};

	function next(x){
		return x.next;
	};

	topo.Solid.prototype.faces = function(){
		return enumerate( this.startFace, notNull, next );
	};

	topo.Solid.prototype.edges = function(){
		return enumerate( this.startEdge, notNull, next );
	};

	topo.Solid.prototype.vertices = function(){
		return enumerate( this.startVertex, notNull, next );
	};

	topo.Face = function( solid, outerLoop, loops, surface, nextFace, prevFace ) {

		Topology.call(this, "Face");
		
		this.solid = solid;
		this.outerLoop = outerLoop;
		this.loops = loop;
		this.surface = surface;
		this.next = nextFace;
		this.prev = prevFace;
		
	}.inherits( Topology );

	topo.Face.prototype.neighbors = function(){

		var start = this.outerLoop.start;
		var cont = function(he){ return he != start; };
		var transform = function(he){ return he.mate().loop.face; };

		return enumerate( start, cont, next, transform );

	};

	topo.Loop = function( startHalfEdge, face, nextLoop, prevLoop ) {

		Topology.call(this, "Loop");

		this.start = startHalfEdge;
		this.face = face;
		this.next = nextLoop;
		this.prev = prevLoop;

	}.inherits( Topology );

	topo.Edge = function( halfEdge1, halfEdge2, nextEdge, prevEdge) {

		Topology.call(this, "Edge");

		this.halfEdge1 = halfEdge1;
		this.halfEdge2 = halfEdge2;
		this.next = nextEdge;
		this.prev = prevEdge;

	}.inherits( Topology );

	topo.addHalfEdge = function(edge, vertex, where, sign){

		// empty loop
		if (!where)	{

		} else {

		}

		var he = new topo.HalfEdge(edge, vertex, where.loop, where, where.prev );
		where.prev.next = he;
		where.prev = he;

		if ( sign )


	};


	topo.HalfEdge = function( parentEdge, vertex, loop, nextHalfEdge, prevHalfEdge) {

		Topology.call(this, "HalfEdge");

		this.edge = parentEdge;
		this.vertex = vertex;
		this.loop = loop;
		this.next = nextHalfEdge;
		this.prev = prevHalfEdge;
		
	}.inherits( Topology );

	topo.HalfEdge.prototype.mate = function(){
		return this.edge.halfEdge1 === this ? this.edge.halfEdge2 : this.edge.halfEdge1;
	}

	topo.Vertex = function( halfEdge, position, nextVertex, prevVertex) {

		Topology.call(this, "Vertex");

		this.halfEdge = halfEdge;
		this.position = position;
		this.next = nextVertex;
		this.prev = prevVertex;

	}.inherits( Topology );

	topo.Vertex.prototype.neighbors = function(){

		var start = this;
		var nextVert = function(v){ return v.halfEdge.mate().next.vertex; }
		var cont = function(v){ return v != this; };
		var transform = function(v){ return v.halfEdge.mate().vertex; };

		return enumerate( start, cont, nextVert, transform );

	};

})(verb.topo, verb.core);



