/* 

Javascript Operator Overloading


Operator Vector Library

A vector math library using overloaded operators: Vector.a = Vector.b * Vector.c 

This code is for research purposes only.
It is a proof-of-concept for operator overloading in JavaScript using proxies.

Unfortunately, this method has no practical applications.


----------------------------------------------------------------------------

MIT License

Copyright (c) 2021 0X-JonMichaelGalindo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

function OperatorVectorLibrary( libraryName = 'V', supportWith = true ) {

    const library = {};
    const access = [];
    let dotOperator = false;


    const Vector = new Proxy( library, {

        has( v, k ) {
            if( supportWith === true ) return true;
            return library.hasOwnProperty( k );
        },

        get ( v, k ) {

            if( typeof k !== 'string' ) return {

                [ true ]: undefined,
                [ supportWith === true && k === Symbol.unscopables ]: window,
                [ k === Symbol.toPrimitive ]: ()=>'[object Object]',

            }[ true ]
            

            if( k.indexOf( 'LITERAL' ) === 0 )
                throw `${libraryName}[ '${k}' ]: Reserved name`;


            if( isNaN( k ) ) {

                if( k.indexOf( ',' ) > -1 ) {

                    const array = k.split( ',' ).map( n => 1*n );
                    if( areNumbers( ...array ) ) {

                        const kind = {
                            [ true ]: null,
                            [ array.length === 2]: Vec2,
                            [ array.length === 3]: Vec3,
                            [ array.length === 4]: Vec4,
                            [ array.length === 4]: Vec4,
                            [ array.length === 9]: Mat3,
                            [ array.length === 16]: Mat4,
                        }[ true ];

                        if( kind === null ) throw `${libraryName} illegal literal`;

                        let name = {
                            [ Vec2 ]: 'LITERAL_VEC2',
                            [ Vec3 ]: 'LITERAL_VEC3',
                            [ Vec4 ]: 'LITERAL_VEC4',
                            [ Mat3 ]: 'LITERAL_MAT3',
                            [ Mat4 ]: 'LITERAL_MAT4',
                        }[ kind ];

                        if( access[0]?.name === name ) name += '_B';

                        if( ! library.hasOwnProperty( name ) ) {
                            Construct( array, name, kind );
                            const { id, construct } = library[ name ];
                            access.push( { id, name } );
                            return construct;
                        }

                        else {
                            ops._set( library[ name ], { source: array, kind } );
                            const { id, construct } = library[ name ];
                            access.push( { id, name } );
                            return construct;
                        }
                    }
                    else {
                        throw `${libraryName} illegal literal`;
                    }

                }

                const name = k;

                //k is identifier
                if( library.hasOwnProperty( k ) ) {
                    //k is existing construct
                    const { id, construct } = library[ name ];
                    access.push( { id, name } );
                    return construct;
                }

                else throw `${libraryName}[ '${k}' ] access before initialization`;

            }

            else {
             
                const name = access[0]?.name === 'LITERAL' ? 'LITERAL_B' : 'LITERAL';

                if( ! library[ name ] ) {
                    
                    Construct( [ 1 * k ], name, Num );

                }

                const { id, construct, source } = library[ name ];

                source[ 0 ] = 1 * k;

                access.push( { id, name } );
                return construct;

            }

        },

        set ( v, k, o ) {

            if( typeof k !== 'string' ) {
                
                throw `${library}: Illegal symbol assignation`;

            }

            if( k.indexOf( 'LITERAL' ) === 0 ) {

                throw `${libraryName}[ '${k}' ]: Reserved name`;

            }

            if( access.length === 0 ) {

                //construction from external source
                if( isNaN( k ) ) {

                    const assignToName = k;

                    const fail = () => { throw `${libraryName}[ '${assignToName}' ]: Illegal constructor`; }

                    if( typeof o === 'object' ) {

                        const fromNames = ( ( x,y,z,w ) => ( {

                            [ true ]: () => null,
                            [ areNumbers( x ) ]: () => Construct( [ x ], assignToName, Num ),
                            [ areNumbers( x,y ) ]: () => Construct( [ x,y ], assignToName, Vec2 ),
                            [ areNumbers( x,y,z ) ]: () => Construct( [ x,y,z ], assignToName, Vec3 ),
                            [ areNumbers( x,y,z,w ) ]: () => Construct( [ x,y,z,w ], assignToName, Vec4 ),

                        }[ true ] ) )( o.x, o.y, o.z, o.w )()

                        if( fromNames !== null ) return fromNames;

                        const fromIterable = ( typeof o[ Symbol.iterator ] !== 'function' ) ? null :
                        ( ( x,y,z,w,m4,m5,m6,m7,m8,m9,m10,m11,m12,m13,m14,m15 ) => ( {

                            [ true ]: () => null,
                            [ areNumbers( x ) ]: () => Construct( [ x ], assignToName, Num ),
                            [ areNumbers( x,y ) ]: () => Construct( [ x,y ], assignToName, Vec2 ),
                            [ areNumbers( x,y,z ) ]: () => Construct( [ x,y,z ], assignToName, Vec3 ),
                            [ areNumbers( x,y,z,w ) ]: () => Construct( [ x,y,z,w ], assignToName, Vec4 ),
                            [ areNumbers( x,y,z,w,m4,m5,m6,m7,m8 ) ]: 
                                () => Construct( [ 
                                    x,  y,  z,
                                    w,  m4, m5,
                                    m6, m7, m8
                                    ], assignToName, Mat3 ),
                            [ areNumbers( x,y,z,w,m4,m5,m6,m7,m8,m9,m10,m11,m12,m13,m14,m15 ) ]: 
                                () => Construct( [ 
                                    x,   y,   z,   w,
                                    m4,  m5,  m6,  m7,
                                    m8,  m9,  m10, m11,
                                    m12, m13, m14, m15
                                    ], assignToName, Mat4 ),
                                    
                        }[ true ] ) )( ...o )();

                        if( fromIterable !== null ) return fromIterable;

                        fail();

                    } else if( typeof o === 'number' ) {

                        return Construct( [ o ], assignToName, Num );

                    } else fail()

                } else {
                    //attempt set literal numeric
                    throw `${libraryName}[ '${k}' ]: Illegal assignation: Name must not be a number`;
                }

            }

            else {

                if( o === dotOperator ) {

                    //dot operator

                    const a = library[ access[ 0 ].name ];
                    const b = library[ dotOperator.name ];

                    access.length = 0;
                    dotOperator = false;
                    
                    const { result: resultObject, kind: resultKind } = ops[ '.' ]( a, b );

                    const destinationName = k;

                    if( ! library.hasOwnProperty( destinationName ) )

                        return Construct( resultObject, destinationName, resultKind );

                    else {
                        
                        const destination = library[ destinationName ];
                        const { construct: destinationConstruct, kind: destinationKind } = destination;

                        if( resultKind !== destinationKind )
                            throw `${libraryName}[ '${destinationName}' ]: Type Error. Required = <${Kind[ destinationKind ]}>, got = <${Kind[ resultKind ]}>`;

                        ops._set( destination, { source: resultObject, kind: resultKind} );

                        return destinationConstruct;

                    }

                }

                //bad expression
                if( access.length > 2 ) {
                    throw `${libraryName}: Expressions must access no more than 2 keys`;
                }

                if( access.length === 1 ) {

                    const { name } = access[ 0 ];


                    //copy
                    if( o === library[ name ].construct ) {

                        access.length = 0;

                        const copySourceName = name;
                        const copyDestinationName = k;

                        const { source, kind } = library[ copySourceName ];

                        const copyOfSource = [ ...source ];

                        if( ! library.hasOwnProperty( copyDestinationName ) )

                            return Construct( copyOfSource, copyDestinationName, kind );
                        

                        else ops._set( library[ copyDestinationName ], library[ copySourceName ] );

                    } 
                    
                    //may have tried expression using both accessor and literal, e.g.   V.a = V.b * 5
                    else {

                        access.length = 0;
                        
                        throw `${libraryName}[ '${k}' ]: Illegal expression`;

                    }

                }

                if( access.length === 2 ) {

                    //compute chain
                    const [ a, b ] = access;

                    access.length = 0;

                    op = {
                        [ true ]: null,
                        [ a.id * b.id ]: '*', //multiply
                        [ a.id + b.id ]: '+', //add
                        [ a.id - b.id ]: '-', //subtract
                        [ a.id / b.id ]: '/', //divide
                    }[ o ];

                    if( op === null ) throw `${libraryName}[ 'k' ]: Illegal expression`;

                    else {

                        const { result: resultObject, kind: resultKind } = ops[ op ]( library[ a.name ], library[ b.name ] );

                        const destinationName = k;

                        if( ! library.hasOwnProperty( destinationName ) ) {

                            return Construct( resultObject, destinationName, resultKind );

                        }

                        else {

                            const destination = library[ k ];

                            ops._set( destination, { source: resultObject, kind: resultKind } );

                        }

                    }

                }

            }

        }

    } );
    

    const Construct = ( source, name, kind ) => {

        const id = key();

        const def = m => ( { 
            get: () => source[ m ], 
            set: v => source[ m ] = v,
            enumerable: true,
        } );
        const alias = ( k, i ) => {
            Object.defineProperty( source, k, def( i ) );
        }

        const like = g => Kind[ kind ] in g;

        if( like({ Num }) ) alias( 'value', 0 );
        if( like({ Num, Vec2, Vec3, Vec4 }) ) [ 'x', 'r', 's' ].forEach( k => alias( k, 0 ) );
        if( like({ Vec2, Vec3, Vec4 }) ) [ 'y', 'g', 't' ].forEach( k => alias( k, 1 ) );
        if( like({ Vec3, Vec4 }) ) [ 'z', 'b', 'p' ].forEach( k => alias( k, 2 ) );
        if( like({ Vec4 }) ) [ 'w', 'a', 'q' ].forEach( k => alias( k, 3 ) );
        if( like({ Mat3 } )) map3.forEach( alias );
        if( like({ Mat4 } )) map4.forEach( alias );

        source.kind = kind;

        const destrand = ( k ) => {
            if( access[ access.length - 1 ].id === id ) return access.pop();

            access.length = 0;
            throw `${libraryName}[ '${name}' ]: Illegal access [${k}] from stranded reference`;
        }
        
        const construct = new Proxy( source, {

            get( source, k ) {

                if( k === Symbol.toPrimitive ) {
                    //inline usage chain
                    //Vector[ varA ] * Vector[ varB ]
                    return () => id;
                }

                if( k === Symbol.iterator ) {
                    destrand( '@@iterator' );

                    //iterate
                    let i = 0;
                    return function* () {
                        while( i in source ) yield source[ i++ ];
                    }
                }

                if( k !== 'kind' && source.hasOwnProperty( k ) ) {
                    destrand( k );

                    return source[ k ];
                }

                if( k === libraryName ) {
                    // Vector[ varA ] . Vector[ varB ]
                    return new Proxy( {}, {
                        get( _, k2 ) {
                            if( library.hasOwnProperty( k2 ) ) {
                                const name = k2;
                                dotOperator = Object.freeze( { name } );
                                return dotOperator;
                            } else {
                                dotOperator = false;
                                access.length = 0;
                                throw `${libraryName}[ '${name}' ]: Illegal dot operator, ${libraryName}[ '${k2}' ] is undefined`
                            }
                        }
                    } );
                }

                if( k === 'length' ) {
                    destrand( k );

                    return source.length;
                }

                if( k === 'toString' ) {
                    destrand( k );

                    //Vector[ varA ].toString()
                    return () => JSON.stringify( source );
                }

                //TODO: support all array functions
                if( k === 'join' ) {
                    destrand( k );

                    //Vector[ varA ].join()
                    return c => source.join( c );

                }

                return undefined;

            },

            set( source, k, n ) {

                destrand( k );

                if( source.hasOwnProperty( k ) ) {

                    if( ! areNumbers( n ) ) throw `${libraryName}[ '${name}' ][ '${k}' ]: Illegal assignment: ${ isNaN( n ) ? 'NaN' : typeof n }`;

                    source[ k ] = n;
                    return n;

                }

                else {

                    throw `${libraryName}[ '${name}' ][ '${k}' ] is not assignable`;

                }
            }

        } );
        
        library[ name ] = { id, construct, kind, source, name }

        return construct;

    }

    const opTypeError = ( op, a, b ) => { throw `${libraryName}: Type Error: ${Kind[a]} ${op} ${Kind[b]} is not a valid operation` };

    const r = () => ( ''+Math.random() ).substring( 2 );
    const key = () => BigInt( r() + r() );

    const areNumbers = ( ...a ) => a.reduce( ( t, m ) => ( t && ( typeof m ==='number' ) && ( ! isNaN( m ) ) ), true );

    const Num = 0;
    const Vec2 = 1;
    const Vec3 = 2;
    const Vec4 = 3;
    const Mat3 = 4;
    const Mat4 = 5;
    const Kind = [ 'Num', 'Vec2', 'Vec3', 'Vec4', 'Mat3', 'Mat4' ];


    //alias vector properties with array indices
    const map3 = [
        'm11', 'm12', 'm13',
        'm21', 'm22', 'm23',
        'm31', 'm32', 'm33'
    ];
    const map4 = [
        'm11', 'm12', 'm13', 'm14',
        'm21', 'm22', 'm23', 'm24',
        'm31', 'm32', 'm33', 'm34',
        'm41', 'm42', 'm43', 'm44'
    ];


    const ops = {
        //a and b are { id, construct, kind, source }
        //select via a.kind, b.kind; apply to a.source, b.source; return { result[], kind }
        '*': ( a, b ) => ( { // { result, kind }

            [ true ]: () => opTypeError( '*', a.kind, b.kind ),

            [ b.kind === Num ] : () => ops[ '*' ]( b, a ),
            [ a.kind === Vec4 && b.kind === Mat4 ] : () => ops[ '*' ]( b, a ),
            [ a.kind === Vec3 && b.kind === Mat3 ] : () => ops[ '*' ]( b, a ),

            [ a.kind === Num ] : ( a, b ) => ( { result: [ ...b ].map( n => n*a.x ), kind: b.kind } ),

            [ a.kind === Vec3 && b.kind === Vec3 ] : ( a, b ) => ( { kind: Vec3,
                result: [
                    a.y*b.z - a.z*b.y,
                    a.z*b.x - a.x*b.z,
                    a.x*b.y - a.y*b.x
                 ] } ),

            [ a.kind === Mat3 && b.kind === Vec3 ] : ( a, b ) => ( { kind: Vec3,
                result: [
                    b.x*a.m11 + b.y*a.m12 + b.z*a.m13,
                    b.x*a.m21 + b.y*a.m22 + b.z*a.m23,
                    b.x*a.m31 + b.y*a.m32 + b.z*a.m33,
                 ] } ),
            [ a.kind === Mat4 && b.kind === Vec4 ] : ( a, b ) => ({ kind: Vec4,
                result: [
                    b.x*a.m11 + b.y*a.m12 + b.z*a.m13 + b.w*a.m14,
                    b.x*a.m21 + b.y*a.m22 + b.z*a.m23 + b.w*a.m24,
                    b.x*a.m31 + b.y*a.m32 + b.z*a.m33 + b.w*a.m34,
                    b.x*a.m41 + b.y*a.m42 + b.z*a.m43 + b.w*a.m44,
                 ] } ),

            [ a.kind === Mat3 && b.kind === Mat3 ]: 
                ( a, b, v = (ai,bi) => [1,2,3].reduce( (e,j) => e + a['m'+ai+j] * b['m'+j+bi], 0 ) ) => 
                ( {kind: Mat3, result: [
                    v(1,1), v(1,2), v(1,3),
                    v(2,1), v(2,2), v(2,3),
                    v(3,1), v(3,2), v(3,3),
                ] } ),
            [ a.kind === Mat4 && b.kind === Mat4 ]: 
                ( a, b, v = (ai,bi) => [1,2,3,4].reduce( (e,j) => e + a['m'+ai+j] * b['m'+j+bi], 0 ) ) => 
                ( {kind: Mat4, result: [
                    v(1,1), v(1,2), v(1,3), v(1,4),
                    v(2,1), v(2,2), v(2,3), v(2,4),
                    v(3,1), v(3,2), v(3,3), v(3,4),
                    v(4,1), v(4,2), v(4,3), v(4,4),
                ] } ),

        }[ true ] )( a.source, b.source ),

        '+': ( a, b ) => ( { // { result, kind }

            [ true ] : () => opTypeError( '+', a.kind, b.kind ),
            [ a.kind === b.kind ] : ( a, b ) => ( { result: [ ...a ].map( ( n, i ) => n + b[i] ), kind: b.kind } ),

        }[ true ] )( a.source, b.source ),


        '-': ( a, b ) => ( { // { result, kind }

            [ true ] : () => opTypeError( '-', a.kind, b.kind ),
            [ a.kind === b.kind ] : ( a, b ) => ( { result: [ ...a ].map( ( n, i ) => n - b[i] ), kind: b.kind } ),

        }[ true ] )( a.source, b.source ),


        '/': ( a, b ) => ( { // { result, kind }

            [ true ] : () => opTypeError( '/', a.kind, b.kind ),
            [ b.kind === Num ] : ( a, b ) => ( { result: [ ...a ].map( ( n ) => n / b.x ), kind: b.kind } ),

        }[ true ] )( a.source, b.source ),


        '.': ( a, b ) => ( { // { result, kind }

            [ true ] : () => opTypeError( '.', a.kind, b.kind ),
            [ a.kind === b.kind ] : ( a, b ) => ( { result: [ [ ...a ].reduce( ( t, n, i ) => t + n * b[i], 0 ) ], kind: Num } ),

        }[ true ] )( a.source, b.source ),

        //a and b are { source, kind }
        //verify kind compatibility, select copier, apply, return null
        _set: ( a, b ) => b.source.forEach( ( n, i ) => a.source[ i ] = n ), // null
    }
    //return: { result{x:,y:,...}, kind: Num|Vec2|... }

    return Vector;
}
