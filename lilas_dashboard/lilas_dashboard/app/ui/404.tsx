'use client';

import React, { useState } from 'react';

const Error404 = () => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className='w-full shadow-[0_2px_0_#D9D9D9] rounded-2xl border bg-white drop-shadow-lg'>
            <div className='flex flex-col justify-center items-center py-10 px-9'>
                <div className=''>
                    <h1 className='text-[#000] text-[64px] leading-[70px] font-semibold'>
                        404
                    </h1>
                </div>
                <div className=''>
                    <h2 className='text-[#000] text-[24px] font-semibold'>
                        Không tìm thấy trang
                    </h2>
                </div>
                <div className='mt-[16px]'>
                    <h3 className='text-[#3C3C43B2] text-[17px] font-medium text-center'>
                        Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
                    </h3>
                </div>
                <div className="mt-[42px]">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                            setIsLoading(true);
                            window.location.reload();
                        }}
                        className="text-[17px] font-semibold leading-[22px] px-[16px] py-[16px] flex justify-center items-center h-[54px] w-[137px] bg-[#338BFF] text-white rounded-md shadow-[0_2px_0_#D9D9D9] hover:bg-[#66B2FF]"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                Đang tải dữ liệu...
                            </span>
                        ) : (
                            'Tải lại trang'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default Error404;