//Objeto page precisa:
//page_obj.has_other_pages
//page_obj.has_previous
//page_number
//page_obj.paginator.page_range
//page_obj.number
//page_obj.has_next
//page_obj.previous_page_number
//page_obj.next_page_number


/* <div class="paginacao">
    {% if page_obj.has_other_pages %}
    <div class="btn-group" role="group" aria-label="Item pagination">
        {% if page_obj.has_previous %}
            <a href="?page={{ page_obj.previous_page_number }}" class="btn btn-outline-primary">&laquo;</a>
        {% endif %}

        {% for page_number in page_obj.paginator.page_range %}
            {% if page_obj.number == page_number %}
                <button class="btn btn-outline-primary active">
                    <span>{{ page_number }} <span class="sr-only">(current)</span></span>
                </button>
            {% else %}
                <a href="?page={{ page_number }}" class="btn btn-outline-primary">
                    {{ page_number }}
                </a>
            {% endif %}
        {% endfor %}

        {% if page_obj.has_next %}
            <a href="?page={{ page_obj.next_page_number }}" class="btn btn-outline-primary">&raquo;</a>
        {% endif %}
    </div>
    {% endif %}
</div> */