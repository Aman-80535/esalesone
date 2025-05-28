import React from 'react'

const Loader = () => {
    return (
        <div className='loader-overlay'>
            <div className="spinner-grow" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )
}

export default Loader