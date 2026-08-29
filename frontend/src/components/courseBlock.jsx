import './courseBlock.css';

export default function CourseBlock({
  type = 'default',
  title,
  description,
  tags = [],
  imageSrc,
  isBookmarked = false,
  onClick,
  onBookmarkClick, 
}) {

  /* 추천 코스 카드 (기본) */
  if (type === 'default') {
    return (
      <article className="course-card" onClick={onClick}>
        <div className="card-image-wrapper">
          <img className="card-image" src={imageSrc} alt={title} />
          
          <button
            type="button"
            className="bookmark-button"
            aria-label="북마크"
            onClick={(e) => {
              e.stopPropagation(); // 코스 디테일 페이지 이동 방지
              if (onBookmarkClick) {
                onBookmarkClick(e); // 부모에게 클릭 사실 전달
              }
            }}
          >
            <img
              src={isBookmarked ? '/icons/채운북마크.png' : '/icons/빈북마크.png'}
              alt="북마크 아이콘"
              className="bookmark-icon"
            />
          </button>
        </div>

        <div className="card-body">
          <div className="card-title-row">
            <h3 className="card-title">{title}</h3>
            <button type="button" className="card-arrow-btn" aria-label="이동">
              <img src="/icons/앞으로.png" alt="" className="arrow-icon" />
            </button>
          </div>
          <p className="card-desc">{description}</p>
          {tags.length > 0 && (
            <div className="tag-group">
              {tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  }

  /* 저장된 코스 카드 (텍스트만) */
  return (
    <article className="saved-course-card" onClick={onClick}>
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{description}</p>

      {tags.length > 0 && (
        <div className="tag-group">
          {tags.map((tag, idx) => (
            <span key={idx} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="card-detail-link">
        <span>자세히 보기</span>
        <img src="/icons/다음.png" alt="" className="arrow-icon-sm" />
      </div>
    </article>
  );
}