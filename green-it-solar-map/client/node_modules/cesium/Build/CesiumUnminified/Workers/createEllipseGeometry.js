/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.133.1
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import {
  EllipseGeometry_default
} from "./chunk-RP4KKY2E.js";
import "./chunk-ZJGO7T2S.js";
import "./chunk-HKHD5FDM.js";
import "./chunk-PFUF2QIK.js";
import "./chunk-VQLQAENU.js";
import "./chunk-DJCPJJSP.js";
import "./chunk-YVAOKOKX.js";
import "./chunk-HSVZWLJD.js";
import "./chunk-7P7R7ERW.js";
import "./chunk-ECGKCTPM.js";
import "./chunk-4MCKK5XE.js";
import "./chunk-JIXKGUWR.js";
import "./chunk-JVNWWKXF.js";
import "./chunk-LYKXQPGW.js";
import "./chunk-UUXKGCBU.js";
import "./chunk-YW2UXIBU.js";
import {
  Cartesian3_default,
  Ellipsoid_default
} from "./chunk-LSYTMSIQ.js";
import "./chunk-E2533KCN.js";
import "./chunk-DNMSVJ4S.js";
import "./chunk-4Z7AGRTU.js";
import "./chunk-7FEVXX5D.js";
import {
  defined_default
} from "./chunk-UXIZVXIR.js";

// packages/engine/Source/Workers/createEllipseGeometry.js
function createEllipseGeometry(ellipseGeometry, offset) {
  if (defined_default(offset)) {
    ellipseGeometry = EllipseGeometry_default.unpack(ellipseGeometry, offset);
  }
  ellipseGeometry._center = Cartesian3_default.clone(ellipseGeometry._center);
  ellipseGeometry._ellipsoid = Ellipsoid_default.clone(ellipseGeometry._ellipsoid);
  return EllipseGeometry_default.createGeometry(ellipseGeometry);
}
var createEllipseGeometry_default = createEllipseGeometry;
export {
  createEllipseGeometry_default as default
};
