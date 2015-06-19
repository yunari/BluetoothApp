<div id="chat" data-role="page" data-footer-exist="true">
    <div id="chat-header" data-role="header" data-position="fixed">
        <h1>
            <span id="chat-header-type"></span>
            <span id="chat-header-name"></span>
        </h1>
    </div>

    <div id="chat-content" data-role="content">
        <ul data-role="listview"></ul>
    </div>

    <div id="chat-footer" data-role="footer" data-position="fixed">
        <div id="ui-textArea">
            <div id="ui-textArea-text">
                <textarea
                    id="text"
                    placeholder="Your message"
                    data-role="none"></textarea>
            </div>
            <div id="ui-textArea-button">
                <a data-role="button" id="ui-mySend">Send</a>
            </div>
        </div>
    </div>
</div>
