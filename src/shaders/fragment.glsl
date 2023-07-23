// precision mediump float;

// テクスチャサンプラーですが、このコードでは実際には使われていません。
uniform sampler2D texture;

// アニメーションの時間を表すuniform変数です。シェーダー内で時間を使って波の動きを制御します。
uniform float time;

// キャンバスの解像度を表すuniform変数です。フラグメントシェーダーでは、画面のピクセル解像度を取得する必要があります。
uniform vec2 resolution;

// 頂点シェーダーからフラグメントシェーダーに渡されるテクスチャ座標を表すvarying変数です。
varying vec2 vUv;

// 方向性のある波の法線を計算する関数です。与えられたパラメータに基づいて、特定の方向と振幅で波を生成します。
vec2 directionalWaveNormal(vec2 uv, float amp, vec2 dir, float freq, float speed, float k) {
    // テクスチャ座標を表すベクトルです。
    // dir は波の方向を表すベクトルで、この関数により計算される波は dir の方向に伸びることになります。
    // freq は波の周波数、time はアニメーションの時間、speed は波の速度を表すパラメータです。この行では、波の位相を計算しています。
    float a = dot(uv, dir) * freq + time * speed; // dotはuvとdirの内積をfloatで返す

    // k は波の減衰指数を表すパラメータで、値が大きいほど波の減衰が強くなります。この行では、波の振幅を計算しています。
    float b = 7.5 * k * freq * amp * pow((sin(a) + 1.0) * 0.5, k - 1.0) * cos(a); // pow(x, y)とxのy乗を返す

    // 波の方向ベクトル dir を b の値（波の振幅）だけスケーリングしたベクトルを返しています。これにより、方向性のある波の法線が得られます。
    return vec2(dir.x * b, dir.y * b);
}

// 波の法線を計算します。先ほど定義したsummedWaveNormal関数を使って波の法線を計算します。
// このコードは、与えられたテクスチャ座標 uv を使用して、複数の方向性のある波の法線を合計して、波の表面の法線を計算する関数 summedWaveNormal を定義しています。
vec3 summedWaveNormal(vec2 uv) {
    // 初期化されたベクトル sum を定義しています。このベクトルは、方向性のある波の法線の合計を格納するために使用されます。
    vec2 sum = vec2(0.0);
    // directionalWaveNormal 関数を使用して、方向性のある波の法線を計算し、sum に加算しています。
    // この行では、周波数が5.0、速度が1.5、減衰指数が1.0の方向性のある波の法線が計算されます。
    // 同様に、他の方向性のある波の法線も計算され、sum に加算されます。それぞれの方向性のある波は異なるパラメータで定義されています。
    sum += directionalWaveNormal(uv, 0.5, normalize(vec2(1.0, 1.5)), 5.0, 1.5, 1.0);
    sum += directionalWaveNormal(uv, 0.25,normalize(vec2(1.4, 1.0)), 11.0, 2.4, 1.5);
    sum += directionalWaveNormal(uv, 0.125, normalize(vec2(0.8, 3.0)), 10.0, 2.0, 2.0);
    sum += directionalWaveNormal(uv, 0.0625, normalize(vec2(1.3, 2.0)), 15.0, 4.0, 2.2);
    sum += directionalWaveNormal(uv, 0.03125, normalize(vec2(1.7, 1.0)), 5.0, 1.8, 3.0);

    // 合計された波の法線ベクトル sum を正規化し、法線ベクトルを返します。
    // ここでは、sum の x および y の成分を反転させているので、波の方向が逆になります。
    // z 成分は1.0に設定されていますが、これは波が垂直方向（上向き）を向いていることを表しています。
    // 波の方向に応じて、波の法線は上向きから垂直方向に変化します。
    return normalize(vec3(-sum.x, -sum.y, 1.0));
}

void main(void) {
    // テクスチャ座標を解像度に合わせて正規化します。
    vec2 uv = (vUv.xy * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    // 波の高さを増やすために、テクスチャ座標のy軸を6倍にスケールします。
    uv.y *= 6.0;

    // 波の法線を計算します。先ほど定義したsummedWaveNormal関数を使って波の法線を計算します。
    vec3 normal = summedWaveNormal(uv);

    // 波の法線に基づいて、ピクセルの色を計算します。波の向きに応じて異なる色を混合し、波の高さに応じて色を調整します。
    vec3 color = mix(vec3(0.0, 5.0, 1.0), vec3(0.2, 1.0, 1.0), dot(normal, normalize(vec3(0.2, 0.2, 0.5))) * 0.5);
    color = mix(color, vec3(0.9, 0.9, 2.0), pow(dot(normal, normalize(vec3(-2.0, -9.0, 0.5))) * 1.5 + 0.5, 1.0));

    // 最終的な色をgl_FragColorに設定します。これが各ピクセルの最終的な色として描画されます。
    gl_FragColor = vec4(color, 1.0);
}