"use client";

import React from "react"

export default function Video({ videosFalUrl }) {
  console.log("ETSTETSTETST", videosFalUrl)
  React.useEffect(() => {
    console.log("ETSTETSTETST", videosFalUrl)
  },[videosFalUrl])

  return (
    <video className="HeroImage" width="960" height="640" autoPlay loop>
      <source key={videosFalUrl} src={videosFalUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}