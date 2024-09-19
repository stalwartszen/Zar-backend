import React from 'react';
import { BasePropertyComponent } from 'adminjs';

const FileUpload = (props) => {
  const { onChange, property, record } = props;

  return (
    <div>
      <input
        type="file"
        onChange={(event) => onChange(property.name, event.target.files[0])}
      />
      {record.params.profile_pic && (
        <a href={`/uploads/homeowners/${record.params.profile_pic}`} target="_blank">
          View current profile picture
        </a>
      )}
    </div>
  );
};

export default FileUpload;
