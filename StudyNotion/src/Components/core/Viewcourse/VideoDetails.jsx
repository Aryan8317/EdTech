import React from 'react'
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import ReactPlayer from 'react-player';
import {BiSkipPreviousCircle} from 'react-icons/bi';
import {BiSkipNextCircle} from 'react-icons/bi';
import {MdOutlineReplayCircleFilled} from 'react-icons/md';
import { markLectureAsComplete } from '../../../services/operations/courseDetailsAPI';
import { setCompletedLectures } from '../../../slices/viewCourseSlice';
import { useDispatch } from 'react-redux';



const VideoDetails = () => {
  const {courseId,sectionId,subsectionId} = useParams();
  const dispatch = useDispatch();
  const {token} = useSelector(state => state.auth);
  const {user}= useSelector(state => state.profile);
  // console.log("user",user._id);
  const {courseSectionData, courseEntireData, completedLectures, totalNoOfLectures} = useSelector(state => state.viewCourse);
  const navigate = useNavigate();
  const playerRef = React.useRef(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);

  const [videoData, setVideoData] = useState([]);
  const [videoEnd, setVideoEnd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect (() => {
    if (courseSectionData.length === 0) {
      return;
    }
    const filteredSection = courseSectionData?.filter((section) => section._id === sectionId);
    const filteredSubsection = filteredSection[0]?.subSection?.filter((subsection) => subsection._id === subsectionId);
    setVideoData(filteredSubsection?.[0]);
    // console.log(filteredSubsection[0]);
    setVideoEnd(false);
  }, [courseSectionData, sectionId, subsectionId]);


  const isLastLecture = () => {
     const currentSectionIndex = courseSectionData?.findIndex((section) => section._id === sectionId);
      const currentSubsectionIndex = courseSectionData[currentSectionIndex]?.subSection.findIndex((subsection) => subsection._id === subsectionId);
      if (currentSubsectionIndex === courseSectionData[currentSectionIndex]?.subSection?.length - 1  && currentSectionIndex === courseSectionData?.length - 1) {
        // console.log("last lecture");
        return true;
      }else {
        // console.log("not last lecture");
        return false;
      }
  }
  
  
  const isFirstLecture = () => {
    const currentSectionIndex = courseSectionData?.findIndex((section) => section._id === sectionId);
    const currentSubsectionIndex = courseSectionData[currentSectionIndex]?.subSection.findIndex((subsection) => subsection._id === subsectionId);
    if (currentSubsectionIndex === 0  && currentSectionIndex === 0) {
      // console.log("first lecture");
      return true;
    }else {
      // console.log("not first lecture");
      return false;
    }
  }

  const nextLecture = () => {
    if (isLastLecture()) {
      return;
    }
    const currentSectionIndex = courseSectionData?.findIndex((section) => section._id === sectionId);
    const currentSubsectionIndex = courseSectionData[currentSectionIndex]?.subSection.findIndex((subsection) => subsection._id === subsectionId);
    if (currentSubsectionIndex === courseSectionData[currentSectionIndex]?.subSection.length - 1) {
      const nextSectionId = courseSectionData[currentSectionIndex + 1]?._id;
      const nextSubsectionId = courseSectionData[currentSectionIndex + 1]?.subSection[0]._id;
      navigate(`/dashboard/enrolled-courses/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubsectionId}`);
    }else {
      const nextSectionId = courseSectionData[currentSectionIndex]._id;
      const nextSubsectionId = courseSectionData[currentSectionIndex].subSection[currentSubsectionIndex + 1]._id;
      navigate(`/dashboard/enrolled-courses/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubsectionId}`);
    }
  }

  const previousLecture = () => {
    if (isFirstLecture()) {
      return;
    }
    const currentSectionIndex = courseSectionData?.findIndex((section) => section._id === sectionId);
    const currentSubsectionIndex = courseSectionData[currentSectionIndex]?.subSection.findIndex((subsection) => subsection._id === subsectionId);
    if (currentSubsectionIndex === 0) {
      const previousSectionId = courseSectionData[currentSectionIndex - 1]._id;
      const previousSubsectionId = courseSectionData[currentSectionIndex - 1]?.subSection[courseSectionData[currentSectionIndex - 1].subSection.length - 1]._id;
      navigate(`/dashboard/enrolled-courses/view-course/${courseId}/section/${previousSectionId}/sub-section/${previousSubsectionId}`);
    }else {
      const previousSectionId = courseSectionData[currentSectionIndex]?._id;
      const previousSubsectionId = courseSectionData[currentSectionIndex]?.subSection[currentSubsectionIndex - 1]._id;
      navigate(`/dashboard/enrolled-courses/view-course/${courseId}/section/${previousSectionId}/sub-section/${previousSubsectionId}`);
    }
  }


  const handleLectureCompletion = async () => {
    const res = await markLectureAsComplete({
      userId: user._id,
      courseId: courseId,
      subSectionId: subsectionId,
    }, token);
    dispatch(setCompletedLectures([...completedLectures, videoData._id]));
    console.log("lecture completed", completedLectures);
  }

  //set video end to false when .play() is called
 
   
  return (
    <div className='md:w-[calc(100vw-320px)] w-screen p-3'>
      {
        !videoData ? <h1>Loading...</h1> :
        (
          <div>
            <div className="w-full relative" style={{ aspectRatio: "16:9" }}>
              <ReactPlayer
                ref={playerRef}
                url={videoData.videoUrl}
                width="100%"
                height="100%"
                playing={playing}
                controls={true}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onProgress={(state) => {
                  setPlayed(state.played);
                  if (state.played >= 0.9) { // Mark as complete when 90% watched
                    setVideoEnd(true);
                  }
                }}
                onDuration={setDuration}
                onEnded={() => setVideoEnd(true)}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      disablePictureInPicture: true
                    }
                  }
                }}
              />
              {
                videoEnd && (
                  <div className='flex justify-center items-center'>
                  <div className='flex justify-center items-center'>
                    {
                      !completedLectures.includes(videoData._id) && (
                        <button onClick={()=>{handleLectureCompletion()}} className='bg-yellow-100 text-richblack-900 absolute top-[20%] hover:scale-90 z-20 font-medium md:text-sm px-4 py-2 rounded-md'>Mark as Completed</button>
                      )
                    }
                  </div>
                  {
                    !isFirstLecture() && (
                      <div className=' z-20 left-0 top-1/2 transform -translate-y-1/2 absolute m-5'>
                        <BiSkipPreviousCircle onClick={previousLecture} className=" text-2xl md:text-5xl bg-richblack-600 rounded-full cursor-pointer hover:scale-90"/>
                        {/* <button onClick={previousLecture} className='bg-blue-500 text-white px-4 py-2 rounded-md'>Previous Lecture</button> */}
                      </div>
                    )

                  }
                  {
                    !isLastLecture() && (
                      <div className=' z-20 right-4 top-1/2 transform -translate-y-1/2 absolute m-5'>
                        <BiSkipNextCircle onClick={nextLecture} className="text-2xl md:text-5xl bg-richblack-600 rounded-full cursor-pointer hover:scale-90"/>
                        {/* <button onClick={nextLecture} className='bg-blue-500 text-white px-4 py-2 rounded-md'>Next Lecture</button> */}
                        </div>
                    )
                  }
                  {
                    <MdOutlineReplayCircleFilled onClick={() =>{ playerRef.current.seekTo(0); setPlaying(true); setVideoEnd(false)}} className="text-2xl md:text-5xl bg-richblack-600 rounded-full cursor-pointer hover:scale-90 absolute top-1/2 z-20"/>
                  }
                  </div>
                )
              }
            </div>
          </div>
        )
      }
      {/* video title and desc */}
      <div className='mt-5'>
        <h1 className='text-2xl font-bold text-richblack-25'>{videoData?.title}</h1>
        <p className='text-gray-500 text-richblack-100'>{videoData?.description}</p>
        </div>
    </div>
  )
}

export default VideoDetails