import React from 'react';
import { useParams } from 'react-router-dom';

import { useGetTeacherDataQuery } from '../teachersApiSlice';
import Loading from '../../../Components/Loading';
import Error from '../../../Components/Error';
import { TeacherCardWrapper } from '../../../Components/TeacherCardWrapper';
import { AddCourses } from './AddAssignment';
import { ViewCourses } from './ViewAssignments';

// Assignment Container
// Renders the assignment based on the classId
export const TeacherAssignmentContainer = () => {
  const { classId } = useParams(); // Retrieve classId from the URL parameters

  // Fetch teacherData based on the classId
  const { data, isLoading, isSuccess, isError, error } =
    useGetTeacherDataQuery(classId);

  // Filtering Courses Data
  const { assignments } = data || {};

  let content;

  // Show loading state while fetching data
  if (isLoading) {
    content = <Loading open={isLoading} />;
  }
  // Render the staff container if data is successfully fetched
  else if (isSuccess) {
    content = (
      <TeacherCardWrapper
        title='Courses'
        dialogChildren={<AddCourses />}
        children={<ViewCourses data={assignments} />}
      />
    );
  }
  // Show error message if there's an error fetching data
  else if (isError) {
    content = <Error error={error} />;
  }
  return content;
};
