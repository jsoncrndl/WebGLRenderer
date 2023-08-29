let Quaternion = function(w, x, y, z) {

    //Force normalized quaternion
    let d = Math.sqrt(w * w + x * x + y * y + z * z);

    let components = {
        x: x / d,
        y: y / d,
        z: z / d,
        w: w / d
    }

    //Optimized vector multiplication from https://gamedev.stackexchange.com/questions/28395/rotating-vector3-by-a-quaternion
    function multiplyVector(vector) {

        let scaleC = 2 * (vector.x * components.x + vector.y * components.y + vector.z * components.z);
        let scaleV = 2 * components.w * components.w - 1;
        let crossX = components.y * vector.z - components.z * vector.y;
        let crossY = components.z * vector.x - components.x * vector.z;
        let crossZ = components.x * vector.y - components.y * vector.x;

        return Vector3(
            scaleC * components.x + scaleV * vector.x + 2 * components.w * crossX,
            scaleC * components.y + scaleV * vector.y + 2 * components.w * crossY,
            scaleC * components.x + scaleV * vector.z + 2 * components.w * crossZ,
        );
    }

    function multiply(other) {
        let w = other.w * components.w - (components.x * other.x + components.y * other.y + components.z * other.z);

        let x = other.w * components.x + other.x * components.w + components.y * other.z - components.z * other.y;
        let y = other.w * components.y + other.y * components.w + components.z * other.x - components.x * other.z;
        let z = other.w * components.z + other.z * components.w + components.x * other.y - components.y * other.x;

        return Quaternion(w, x, y, z);
    }

    // From wikipedia: https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
    function computeEuler() {
        let sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
        let cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
        let eulerX = Math.atan2(sinr_cosp, cosr_cosp);

        // pitch (y-axis rotation)
        let sinp = Math.sqrt(1 + 2 * (q.w * q.y - q.x * q.z));
        let cosp = Math.sqrt(1 - 2 * (q.w * q.y - q.x * q.z));
        let eulerY = 2 * Math.atan2(sinp, cosp) - M_PI / 2;

        // yaw (z-axis rotation)
        let siny_cosp = 2 * (q.w * q.z + q.x * q.y);
        let cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        let eulerZ = Math.atan2(siny_cosp, cosy_cosp);

        return {
            x: eulerX,
            y: eulerY,
            z: eulerZ
        }
    }

    return {
        multiplyVector:multiplyVector,
        multiply:multiply,
        get eulerAngles() { return computeEuler(); },
        get w() { return w },
        get x() { return x },
        get y() { return y },
        get z() { return z }
    }
};

// From wikipedia: https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
Quaternion.fromEuler = function(xRot, yRot, zRot) {
    let deg2rad = Math.PI / 180;

    // http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m

    xRot *= deg2rad;
    yRot *= deg2rad;
    zRot *= deg2rad;

    const cos = Math.cos;
    const sin = Math.sin;

    const c1 = cos( xRot / 2);
    const c2 = cos( yRot / 2);
    const c3 = cos( zRot / 2);

    const s1 = sin( xRot / 2);
    const s2 = sin( yRot / 2);
    const s3 = sin( zRot / 2);

    let x;
    let y;
    let z;
    let w;

    x = s1 * c2 * c3 - c1 * s2 * s3;
    y = c1 * s2 * c3 + s1 * c2 * s3;
    z = c1 * c2 * s3 - s1 * s2 * c3;
    w = c1 * c2 * c3 + s1 * s2 * s3;

    // switch ( order ) {

    //     case 'XYZ':
    //         x = s1 * c2 * c3 + c1 * s2 * s3;
    //         y = c1 * s2 * c3 - s1 * c2 * s3;
    //         z = c1 * c2 * s3 + s1 * s2 * c3;
    //         w = c1 * c2 * c3 - s1 * s2 * s3;
    //         break;

    //     case 'YXZ':
    //         x = s1 * c2 * c3 + c1 * s2 * s3;
    //         this._y = c1 * s2 * c3 - s1 * c2 * s3;
    //         this._z = c1 * c2 * s3 - s1 * s2 * c3;
    //         this._w = c1 * c2 * c3 + s1 * s2 * s3;
    //         break;

    //     case 'ZXY':
    //         this._x = s1 * c2 * c3 - c1 * s2 * s3;
    //         this._y = c1 * s2 * c3 + s1 * c2 * s3;
    //         this._z = c1 * c2 * s3 + s1 * s2 * c3;
    //         this._w = c1 * c2 * c3 - s1 * s2 * s3;
    //         break;

    //     case 'ZYX':

    //         break;

    //     case 'YZX':
    //         this._x = s1 * c2 * c3 + c1 * s2 * s3;
    //         this._y = c1 * s2 * c3 + s1 * c2 * s3;
    //         this._z = c1 * c2 * s3 - s1 * s2 * c3;
    //         this._w = c1 * c2 * c3 - s1 * s2 * s3;
    //         break;

    //     case 'XZY':
    //         this._x = s1 * c2 * c3 - c1 * s2 * s3;
    //         this._y = c1 * s2 * c3 - s1 * c2 * s3;
    //         this._z = c1 * c2 * s3 + s1 * s2 * c3;
    //         this._w = c1 * c2 * c3 + s1 * s2 * s3;
    //         break;
    //     default:
    //         console.warn( 'THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order );

    // }

    return Quaternion(w, x, y, z);
}

Quaternion.fromAxisAngle = function(axis, angle) {
    angle *= Math.PI / 180
    axis = Vector3(axis.x, axis.y, axis.z);
    axis.normalize();

    let sinAngle = Math.sin(angle / 2);
    return Quaternion(Math.cos(angle / 2), axis.x * sinAngle, axis.y * sinAngle, axis.z * sinAngle);
}

Quaternion.lookAtRotation = function(forward) {

}

let Vector3 = function(x, y, z) { 

    let that = {
        x: x,
        y: y,
        z: z
    };

    function dot(vector) {
        return that.x * vector.x + that.y * vector.y + that.z * vector.z;
    }

    function multiply(scale) {
        return Vector3(that.x * scale, that.y * scale, that.z * scale);
    }

    function add(vector) {
        return Vector3(that.x + vector.x, that.y + vector.y, that.z + vector.z);
    }

    function toArray() {
        return [that.x, that.y, that.z];
    }

    function normalize() {
        if (that.x == 0 && that.y == 0 && that.z == 0) {
            return;
        }
        let d = Math.sqrt(that.x * that.x + that.y * that.y + that.z * that.z);
        that.x /= d;
        that.y /= d;
        that.z /= d;
    }

    let api = {
        get x() { return that.x; },
        get y() { return that.y; },
        get z() { return that.z; },
        normalize: normalize,
        dot: dot,
        multiply: multiply,
        add: add,
        toArray: toArray
    };

    return api;
}

Vector3.up = function() {
    return Vector3(0, 1, 0);
}();

Vector3.forward = function() {
    return Vector3(0, 0, 1);
}();

Vector3.right = function() {
    return Vector3(1, 0, 0);
}();

Vector3.cross = function(v1, v2) {
    return Vector3(v1.y * v2.z - v2.y * v1.z, -v1.x * v2.z - v2.x * v1.z, v1.x * v2.y - v2.x * v1.y);
}