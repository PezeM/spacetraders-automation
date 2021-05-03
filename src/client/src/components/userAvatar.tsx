import React from 'react';
import {Avatar} from 'antd';
import {AvatarSize} from "antd/es/avatar/SizeContext";
import {getColorOfItem} from "../helpers/color";

export const UserAvatar = (username: string, size: AvatarSize = 'large') => {
    return (
        <div>
            <Avatar
                style={{
                    backgroundColor: getColorOfItem(username, 7),
                    verticalAlign: 'middle',
                }}
                size={size}
            >
                {username ? username.charAt(0).toUpperCase() : ''}
            </Avatar>
        </div>
    );
};