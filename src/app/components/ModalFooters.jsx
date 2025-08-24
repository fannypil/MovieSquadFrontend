"use client";

import React from "react";

export function SaveCancelFooter({ onCancel, onSave, isLoading, saveText = "Save", cancelText = "Cancel", danger = false }) {
  return (
    <>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={onCancel}
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button
        type="button"
        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Loading...
          </>
        ) : (
          saveText
        )}
      </button>
    </>
  );
}

export function DeleteSaveFooter({ onCancel, onSave, onDelete, isLoading, saveText = "Save", deleteText = "Delete" }) {
  return (
    <>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="spinner-border spinner-border-sm me-2"></span>
        ) : null}
        {saveText}
      </button>
      <button
        className="btn btn-danger ms-2"
        type="button"
        onClick={onDelete}
        disabled={isLoading}
      >
        {deleteText}
      </button>
    </>
  );
}